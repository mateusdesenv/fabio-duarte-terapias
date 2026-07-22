import { stateCollection } from './database.js'

const stateId = 'fabio-duarte-terapias'

export async function readState() {
  const collection = await stateCollection()
  const document = await collection.findOne({ _id: stateId })
  return document?.data ?? null
}

export async function writeState(data: unknown) {
  if (!data || typeof data !== 'object') throw new Error('Dados inválidos')
  const collection = await stateCollection()
  await collection.updateOne(
    { _id: stateId },
    { $set: { data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  )
  return data
}
