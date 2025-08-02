import http from 'node:http'
import fs from 'node:fs'

import * as global from './globals'
import * as oauth from './oauth'

const SPOTIFY_OAUTH_TOKEN_URL = process.env.SPOTIFY_OAUTH_TOKEN_URL ?? ''
const SPOTIFY_AUTH_REDIRECT = process.env.SPOTIFY_AUTH_REDIRECT ?? ''
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? ''

export async function refreshAccessToken(
  _request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const FILENAME = 'spotify-token.json'

  let token = JSON.parse(fs.readFileSync(FILENAME).toString()) as global.Token

  const refreshedToken = await oauth.refreshAccessToken(SPOTIFY_OAUTH_TOKEN_URL, {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    refreshToken: token.refresh_token,
  }, 'basicAuth')

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

  const token = await oauth.getAccessToken(SPOTIFY_OAUTH_TOKEN_URL, {
    code: authCode,
    redirectUri: SPOTIFY_AUTH_REDIRECT,
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
  }, 'basicAuth')

  fs.writeFileSync('spotify-token.json', token)

  response.end('Token stored!')
}
