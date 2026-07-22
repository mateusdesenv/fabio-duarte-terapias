import type { Request, Response } from 'express'
import { dataHandler } from '../apps/api/src/handlers.js'

export default async function handler(request: Request, response: Response) {
  return dataHandler(request, response)
}
