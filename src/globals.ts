import dotenv from 'dotenv'

dotenv.config({ quiet: true })

export const HOSTNAME = process.env.HOSTNAME ?? ''
export const PORT = process.env.PORT ?? ''

export const INTEGRATIONS_BASE_URL = `http://${HOSTNAME}:${PORT}`
