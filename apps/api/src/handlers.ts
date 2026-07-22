import type { Request, Response } from 'express'
import { checkDatabase } from './database.js'
import { readState, writeState } from './state.js'

export async function healthHandler(_request: Request, response: Response) {
  try {
    await checkDatabase()
    response.status(200).json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Falha no health check', error instanceof Error ? error.message : error)
    response.status(503).json({ status: 'error', database: 'unavailable' })
  }
}

export async function dataHandler(request: Request, response: Response) {
  try {
    if (request.method === 'GET') return response.status(200).json({ data: await readState() })
    if (request.method === 'PUT') return response.status(200).json({ data: await writeState(request.body) })
    response.setHeader('Allow', 'GET, PUT')
    return response.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Falha na API de dados', error instanceof Error ? error.message : error)
    return response.status(500).json({ error: 'Não foi possível acessar os dados' })
  }
}
