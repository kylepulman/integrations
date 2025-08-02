import dotenv from 'dotenv'
import fs from 'node:fs'
import http from 'node:http'

import * as global from './globals'
import * as oauth from './oauth'

dotenv.config({ quiet: true })

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID ?? ''
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET ?? ''
const HUBSPOT_OAUTH_TOKEN_URL = process.env.HUBSPOT_OAUTH_TOKEN_URL ?? ''
const HUBSPOT_AUTH_REDIRECT = process.env.HUBSPOT_AUTH_REDIRECT ?? ''

export function isRefreshAccessToken(req: http.IncomingMessage) {
  return req.method === 'GET' && req.url === '/hubspot/auth/refresh'
}

export function isGetAccessToken(req: http.IncomingMessage) {
  return req.method === 'GET' && req.url?.startsWith('/hubspot/auth/redirect')
}

export async function refreshAccessToken(
  _request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const FILENAME = 'hubspot-token.json'

  let token = JSON.parse(fs.readFileSync(FILENAME).toString()) as global.Token

  const refreshedToken = await oauth.refreshAccessToken(
    HUBSPOT_OAUTH_TOKEN_URL,
    {
      clientId: HUBSPOT_CLIENT_ID,
      clientSecret: HUBSPOT_CLIENT_SECRET,
      refreshToken: token.refresh_token,
    },
    'formData',
  )

  token = {
    ...token,
    ...refreshedToken,
  }

  fs.writeFileSync(FILENAME, JSON.stringify(token))

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
  }, 'formData')

  fs.writeFileSync('hubspot-token.json', token)

  response.end('Token stored!')
}
