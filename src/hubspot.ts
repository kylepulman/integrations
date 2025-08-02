import dotenv from 'dotenv'
import fs from 'node:fs'
import http from 'node:http'

dotenv.config({ quiet: true })

type Token = {
  token_type: 'bearer'
  refresh_token: string
  access_token: string
  expires_in: number
}

const INTEGRATIONS_BASE_URL = `http://${process.env.HOSTNAME ?? ''}:${process.env.PORT ?? ''}`

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID ?? ''
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET ?? ''
const HUBSPOT_OAUTH_TOKEN_URL = process.env.HUBSPOT_OAUTH_TOKEN_URL ?? ''
const HUBSPOT_AUTH_REDIRECT = process.env.HUBSPOT_AUTH_REDIRECT ?? ''

export async function refreshAccessToken(
  _request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  let token = JSON.parse(fs.readFileSync('hubspot-token.json').toString()) as Token

  const formData = new URLSearchParams()

  formData.set('grant_type', 'refresh_token')
  formData.set('refresh_token', token.refresh_token)
  formData.set('client_id', HUBSPOT_CLIENT_ID)
  formData.set('client_secret', HUBSPOT_CLIENT_SECRET)

  const res = await fetch(HUBSPOT_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  token = {
    ...token,
    ...(await res.json() as Record<string, unknown>),
  }

  fs.writeFileSync('hubspot-token.json', JSON.stringify(token))

  response.end('Token refreshed!')
}

export async function getAccessToken(
  request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const url = new URL(`${INTEGRATIONS_BASE_URL}${request.url ?? ''}`)

  const authCode = url.searchParams.get('code') ?? ''

  const formData = new URLSearchParams()

  formData.set('grant_type', 'authorization_code')
  formData.set('code', authCode)
  formData.set('redirect_uri', HUBSPOT_AUTH_REDIRECT)
  formData.set('client_id', HUBSPOT_CLIENT_ID)
  formData.set('client_secret', HUBSPOT_CLIENT_SECRET)

  console.log(formData.toString())

  const res = await fetch(HUBSPOT_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const token = await res.text()

  fs.writeFileSync('hubspot-token.json', token)

  response.end('Token stored!')
}
