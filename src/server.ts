import dotenv from 'dotenv'
import http from 'node:http'

import * as hubspot from './hubspot'
import * as twilio from './twilio'
import * as spotify from './spotify'
import * as stripe from './stripe'
import * as postmark from './postmark'

dotenv.config({ quiet: true })

const PORT = Number(process.env.PORT)
const HOSTNAME = process.env.HOSTNAME

const server = http.createServer()

server.listen(PORT, HOSTNAME)

server.on('listening', () => {
  console.log(`Listening at http://%s:%d...`, HOSTNAME, PORT)
})

server.on('error', (error) => {
  if (
    'code' in error
    && error.code === 'EADDRINUSE'
    && 'port' in error
  ) {
    console.error(`Port %d is in use...`, error.port)
  }
  else {
    console.error(error)
  }
  process.exit(1)
})

server.on('request', (request, response) => {
  console.log(`${request.method ?? ''} ${request.url ?? ''}`)

  switch (true) {
    case request.method === 'GET' && request.url === '/ping':
      response.end('pong')
      break
    case request.method === 'POST' && request.url === '/postmark/broadcast/send':
      void postmark.sendEmail(request, response)
      break
    case request.method === 'GET' && request.url === '/spotify/auth/refresh':
      void spotify.refreshAccessToken(request, response)
      break
    case request.method === 'GET' && request.url?.startsWith('/spotify/auth/redirect'):
      void spotify.getAccessToken(request, response)
      break
    case request.method === 'GET' && request.url === '/hubspot/auth/refresh':
      void hubspot.refreshAccessToken(request, response)
      break
    case request.method === 'GET' && request.url?.startsWith('/hubspot/auth/redirect'):
      void hubspot.getAccessToken(request, response)
      break
    case request.method === 'POST' && request.url === '/stripe/products/create':
      void stripe.createProduct(request, response)
      break
    case request.method === 'POST' && request.url === '/twilio/sms/verify':
      twilio.createVerification()
        .then(status => response.end(status))
        .catch((reason: unknown) => {
          console.error('@twilio.createVerification:', reason)

          response.statusCode = 400
          response.end('Bad Request')
        })
      break
    default:
      response.statusCode = 404
      response.end('Not Found')
      break
  }
})
