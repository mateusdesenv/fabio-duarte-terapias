import type { Collection } from 'mongodb'
import { ensureIndexes, entityCollections, legacyStateCollection, type StoredEntity } from './database.js'

type ApplicationState = {
  patients: StoredEntity[]
  services: StoredEntity[]
  appointments: StoredEntity[]
}

const legacyStateId = 'fabio-duarte-terapias'

function isApplicationState(value: unknown): value is ApplicationState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<ApplicationState>
  return Array.isArray(state.patients) && Array.isArray(state.services) && Array.isArray(state.appointments)
}

async function syncCollection(collection: Collection<StoredEntity>, items: StoredEntity[]) {
  const validItems = items.filter(item => item?.id)
  if (validItems.length) {
    await collection.bulkWrite(validItems.map(item => ({
      replaceOne: { filter: { id: item.id }, replacement: item, upsert: true },
    })), { ordered: false })
    await collection.deleteMany({ id: { $nin: validItems.map(item => item.id) } })
  } else {
    await collection.deleteMany({})
  }
}

async function removeLegacyCollection() {
  const legacy = await legacyStateCollection()
  await legacy.deleteOne({ _id: legacyStateId })
  try { await legacy.drop() }
  catch (error) {
    if (!(error instanceof Error) || !error.message.includes('ns not found')) throw error
  }
}

async function migrateLegacyState() {
  const { clients, therapies, appointments } = await entityCollections()
  const total = await Promise.all([clients.countDocuments(), therapies.countDocuments(), appointments.countDocuments()])
  if (total.some(count => count > 0)) return

  const legacy = await legacyStateCollection()
  const document = await legacy.findOne({ _id: legacyStateId })
  if (!isApplicationState(document?.data)) return

  await Promise.all([
    syncCollection(clients, document.data.patients),
    syncCollection(therapies, document.data.services),
    syncCollection(appointments, document.data.appointments),
  ])
  await removeLegacyCollection()
}

export async function readState(): Promise<ApplicationState | null> {
  await migrateLegacyState()
  await ensureIndexes()
  const { clients, therapies, appointments } = await entityCollections()
  const [patients, services, scheduled] = await Promise.all([
    clients.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray(),
    therapies.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray(),
    appointments.find({}, { projection: { _id: 0 } }).sort({ date: 1, time: 1 }).toArray(),
  ])
  if (!patients.length && !services.length && !scheduled.length) return null
  return { patients, services, appointments: scheduled }
}

export async function writeState(data: unknown) {
  if (!isApplicationState(data)) throw new Error('Dados inválidos')
  await ensureIndexes()
  const { clients, therapies, appointments } = await entityCollections()
  await Promise.all([
    syncCollection(clients, data.patients),
    syncCollection(therapies, data.services),
    syncCollection(appointments, data.appointments),
  ])
  await removeLegacyCollection()
  return data
}
