import { MongoClient } from 'mongodb'

const databaseName = process.env.MONGODB_DATABASE || 'fabio_duarte_terapias'
let clientPromise: Promise<MongoClient> | undefined

function getClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI não configurada')
  clientPromise ??= new MongoClient(uri).connect()
  return clientPromise
}

export async function stateCollection() {
  const client = await getClient()
  return client.db(databaseName).collection<{ _id: string; data: unknown; createdAt: Date; updatedAt: Date }>('application_state')
}

export async function checkDatabase() {
  const client = await getClient()
  await client.db(databaseName).command({ ping: 1 })
}
