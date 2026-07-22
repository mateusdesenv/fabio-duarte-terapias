import { MongoClient, type Collection, type Db } from 'mongodb'

export type StoredEntity = { id: string; [key: string]: unknown }
type LegacyState = { _id: string; data: unknown; createdAt: Date; updatedAt: Date }

const databaseName = process.env.MONGODB_DATABASE || 'fabio_duarte_terapias'
let clientPromise: Promise<MongoClient> | undefined
let indexesPromise: Promise<unknown> | undefined

function getClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI não configurada')
  clientPromise ??= new MongoClient(uri).connect()
  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await getClient()
  return client.db(databaseName)
}

export async function entityCollections() {
  const database = await getDatabase()
  return {
    database,
    clients: database.collection<StoredEntity>('clientes'),
    therapies: database.collection<StoredEntity>('terapias'),
    appointments: database.collection<StoredEntity>('agendamentos'),
  }
}

export async function legacyStateCollection(): Promise<Collection<LegacyState>> {
  const database = await getDatabase()
  return database.collection<LegacyState>('application_state')
}

export async function ensureIndexes() {
  indexesPromise ??= entityCollections().then(({ clients, therapies, appointments }) => Promise.all([
    clients.createIndex({ id: 1 }, { unique: true }),
    clients.createIndex({ phone: 1 }),
    clients.createIndex({ name: 1 }),
    therapies.createIndex({ id: 1 }, { unique: true }),
    therapies.createIndex({ active: 1 }),
    appointments.createIndex({ id: 1 }, { unique: true }),
    appointments.createIndex({ date: 1, time: 1 }),
    appointments.createIndex({ patientId: 1 }),
    appointments.createIndex({ packageId: 1 }, { sparse: true }),
  ]))
  return indexesPromise
}

export async function checkDatabase() {
  const database = await getDatabase()
  await database.command({ ping: 1 })
}
