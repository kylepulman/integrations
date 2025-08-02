import dotenv from 'dotenv'
import fs from 'node:fs'
import http from 'node:http'
import * as oauth from './oauth'
import * as global from './globals'

dotenv.config({ quiet: true })

type Token = {
  token_type: 'bearer'
  refresh_token: string
  access_token: string
  expires_in: number
}

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID ?? ''
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET ?? ''
const HUBSPOT_OAUTH_TOKEN_URL = process.env.HUBSPOT_OAUTH_TOKEN_URL ?? ''
const HUBSPOT_AUTH_REDIRECT = process.env.HUBSPOT_AUTH_REDIRECT ?? ''

export async function refreshAccessToken(
  _request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  let token = JSON.parse(fs.readFileSync('hubspot-token.json').toString()) as Token

  const refreshedToken = await oauth.refreshAccessToken(HUBSPOT_OAUTH_TOKEN_URL, {
    clientId: HUBSPOT_CLIENT_ID,
    clientSecret: HUBSPOT_CLIENT_SECRET,
    refreshToken: token.refresh_token,
  })

  token = {
    ...token,
    ...(refreshedToken),
  }

  fs.writeFileSync('hubspot-token.json', JSON.stringify(token))

  response.end('Token refreshed!')
}

export async function getAccessToken(
  request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const pathname = request.url

  if (!pathname) {
    response.statusCode = 400
    response.end('Bad Request')
    return
  }

  const url = new URL(`${global.INTEGRATIONS_BASE_URL}${pathname}`)

  const authCode = url.searchParams.get('code')

  if (!authCode) {
    throw new Error('authCode not found at getAccessToken')
  }

  const token = await oauth.getAccessToken(HUBSPOT_OAUTH_TOKEN_URL, {
    code: authCode,
    redirectUri: HUBSPOT_AUTH_REDIRECT,
    clientId: HUBSPOT_CLIENT_ID,
    clientSecret: HUBSPOT_CLIENT_SECRET,
  })

  fs.writeFileSync('hubspot-token.json', token)

  response.end('Token stored!')
}
