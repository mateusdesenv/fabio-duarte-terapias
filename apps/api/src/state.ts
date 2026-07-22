import { ObjectId, type Collection, type MongoServerError } from 'mongodb'
import { ensureIndexes, entityCollections, legacyStateCollection, type StoredEntity } from './database.js'

type ApiEntity = { id: string; [key: string]: unknown }
type ApplicationState = {
  patients: ApiEntity[]
  services: ApiEntity[]
  appointments: ApiEntity[]
}

const legacyStateId = 'fabio-duarte-terapias'
let objectIdMigrationPromise: Promise<void> | undefined

function isApplicationState(value: unknown): value is ApplicationState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<ApplicationState>
  return Array.isArray(state.patients) && Array.isArray(state.services) && Array.isArray(state.appointments)
}

function objectIdFrom(value: unknown) {
  return typeof value === 'string' && ObjectId.isValid(value) ? new ObjectId(value) : new ObjectId()
}

function withoutApiId(item: ApiEntity, _id: ObjectId): StoredEntity {
  const { id: _discardedId, _id: _discardedMongoId, ...fields } = item
  return { _id, ...fields }
}

function prepareDocuments(data: ApplicationState) {
  const patientIds = new Map<string, ObjectId>()
  const serviceIds = new Map<string, ObjectId>()

  const patients = data.patients.map(item => {
    const _id = objectIdFrom(item.id)
    patientIds.set(item.id, _id)
    return withoutApiId(item, _id)
  })
  const services = data.services.map(item => {
    const _id = objectIdFrom(item.id)
    serviceIds.set(item.id, _id)
    return withoutApiId(item, _id)
  })
  const appointments = data.appointments.map(item => {
    const document = withoutApiId(item, objectIdFrom(item.id))
    const patientId = patientIds.get(String(item.patientId))
    const serviceId = serviceIds.get(String(item.serviceId))
    if (patientId) document.patientId = patientId
    else if (ObjectId.isValid(String(item.patientId))) document.patientId = new ObjectId(String(item.patientId))
    if (serviceId) document.serviceId = serviceId
    else if (ObjectId.isValid(String(item.serviceId))) document.serviceId = new ObjectId(String(item.serviceId))
    return document
  })
  return { patients, services, appointments }
}

async function syncCollection(collection: Collection<StoredEntity>, items: StoredEntity[]) {
  if (items.length) {
    await collection.bulkWrite(items.map(item => ({
      replaceOne: { filter: { _id: item._id }, replacement: item, upsert: true },
    })), { ordered: false })
    await collection.deleteMany({ _id: { $nin: items.map(item => item._id) } })
  } else {
    await collection.deleteMany({})
  }
}

async function syncState(data: ApplicationState) {
  const prepared = prepareDocuments(data)
  const { clients, therapies, appointments } = await entityCollections()
  await Promise.all([
    syncCollection(clients, prepared.patients),
    syncCollection(therapies, prepared.services),
    syncCollection(appointments, prepared.appointments),
  ])
}

async function removeLegacyCollection() {
  const legacy = await legacyStateCollection()
  await legacy.deleteOne({ _id: legacyStateId })
  try { await legacy.drop() }
  catch (error) {
    if ((error as MongoServerError)?.code !== 26) throw error
  }
}

async function migrateLegacyState() {
  const { clients, therapies, appointments } = await entityCollections()
  const total = await Promise.all([clients.countDocuments(), therapies.countDocuments(), appointments.countDocuments()])
  if (total.some(count => count > 0)) return
  const legacy = await legacyStateCollection()
  const document = await legacy.findOne({ _id: legacyStateId })
  if (!isApplicationState(document?.data)) return
  await syncState(document.data)
  await removeLegacyCollection()
}

async function dropLegacyIdIndex(collection: Collection<StoredEntity>) {
  try { await collection.dropIndex('id_1') }
  catch (error) {
    if ((error as MongoServerError)?.code !== 27) throw error
  }
}

async function migrateDocumentsToObjectIds() {
  const { clients, therapies, appointments } = await entityCollections()
  await Promise.all([dropLegacyIdIndex(clients), dropLegacyIdIndex(therapies), dropLegacyIdIndex(appointments)])

  const [clientDocuments, therapyDocuments, appointmentDocuments] = await Promise.all([
    clients.find({}).toArray(), therapies.find({}).toArray(), appointments.find({}).toArray(),
  ])
  const patientIds = new Map(clientDocuments.map(document => [String(document.id || document._id), document._id]))
  const serviceIds = new Map(therapyDocuments.map(document => [String(document.id || document._id), document._id]))

  await Promise.all([
    ...clientDocuments.filter(document => 'id' in document).map(document => clients.updateOne({ _id: document._id }, { $unset: { id: '' } })),
    ...therapyDocuments.filter(document => 'id' in document).map(document => therapies.updateOne({ _id: document._id }, { $unset: { id: '' } })),
    ...appointmentDocuments.map(document => {
      const updates: Record<string, unknown> = {}
      const patientId = patientIds.get(String(document.patientId))
      const serviceId = serviceIds.get(String(document.serviceId))
      if (patientId) updates.patientId = patientId
      else if (ObjectId.isValid(String(document.patientId))) updates.patientId = new ObjectId(String(document.patientId))
      if (serviceId) updates.serviceId = serviceId
      else if (ObjectId.isValid(String(document.serviceId))) updates.serviceId = new ObjectId(String(document.serviceId))
      return appointments.updateOne({ _id: document._id }, { $set: updates, $unset: { id: '' } })
    }),
  ])
}

function ensureObjectIdMigration() {
  objectIdMigrationPromise ??= migrateDocumentsToObjectIds()
  return objectIdMigrationPromise
}

function toApiEntity(document: StoredEntity, appointment = false): ApiEntity {
  const { _id, ...fields } = document
  if (appointment) {
    if (fields.patientId instanceof ObjectId) fields.patientId = fields.patientId.toHexString()
    if (fields.serviceId instanceof ObjectId) fields.serviceId = fields.serviceId.toHexString()
  }
  return { id: _id.toHexString(), ...fields }
}

export async function readState(): Promise<ApplicationState | null> {
  await migrateLegacyState()
  await ensureObjectIdMigration()
  await ensureIndexes()
  const { clients, therapies, appointments } = await entityCollections()
  const [patients, services, scheduled] = await Promise.all([
    clients.find({}).sort({ name: 1 }).toArray(),
    therapies.find({}).sort({ name: 1 }).toArray(),
    appointments.find({}).sort({ date: 1, time: 1 }).toArray(),
  ])
  if (!patients.length && !services.length && !scheduled.length) return null
  return {
    patients: patients.map(document => toApiEntity(document)),
    services: services.map(document => toApiEntity(document)),
    appointments: scheduled.map(document => toApiEntity(document, true)),
  }
}

export async function writeState(data: unknown) {
  if (!isApplicationState(data)) throw new Error('Dados inválidos')
  await migrateLegacyState()
  await ensureObjectIdMigration()
  await syncState(data)
  await ensureIndexes()
  await removeLegacyCollection()
  return readState()
}
