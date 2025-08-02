import dotenv from 'dotenv'

dotenv.config({ quiet: true })

export type Token = {
  token_type: 'bearer'
  refresh_token: string
  access_token: string
  expires_in: number
}

export const HOSTNAME = process.env.HOSTNAME ?? ''
export const PORT = process.env.PORT ?? ''

export const INTEGRATIONS_BASE_URL = `http://${HOSTNAME}:${PORT}`
