import dotenv from 'dotenv'
import express from 'express'
import { dataHandler, healthHandler } from './handlers.js'

dotenv.config({ path: new URL('../../../.env.local', import.meta.url) })

const app = express()
app.use(express.json({ limit: '2mb' }))
app.get('/api/health', healthHandler)
app.all('/api/data', dataHandler)

const port = Number(process.env.API_PORT || 3001)
app.listen(port, '127.0.0.1', () => console.log(`API disponível em http://127.0.0.1:${port}`))
