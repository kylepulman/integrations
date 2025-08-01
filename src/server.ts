import dotenv from 'dotenv'
import http from 'node:http'

import * as twilio from './twilio'

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
  switch (true) {
    case request.method === 'GET' && request.url === '/ping':
      response.end('pong')
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
