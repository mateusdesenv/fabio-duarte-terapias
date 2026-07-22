import type { Request, Response } from 'express'
import { healthHandler } from '../apps/api/src/handlers.js'

export default async function handler(request: Request, response: Response) {
  return healthHandler(request, response)
}
