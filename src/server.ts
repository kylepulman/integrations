import http from 'node:http'
import fallback from './fallback'

import * as global from './globals'
import * as hubspot from './hubspot'
import * as ping from './ping'
import * as postmark from './postmark'
import * as spotify from './spotify'
import * as stripe from './stripe'
import * as twilio from './twilio'

const server = http.createServer()

server.listen(global.PORT, global.HOSTNAME)

server.on('listening', () => {
  console.log(`Listening at http://%s:%d...`, global.HOSTNAME, global.PORT)
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

server.on('request', (req, res) => {
  console.log(`${req.method ?? ''} ${req.url ?? ''}`)

  switch (true) {
    case ping.isGetPong(req): ping.getPong(req, res); break
    case postmark.isSendEmail(req): void postmark.sendEmail(req, res); break
    case spotify.isRefreshAccessToken(req): void spotify.refreshAccessToken(req, res); break
    case spotify.isGetAccessToken(req): void spotify.getAccessToken(req, res); break
    case hubspot.isRefreshAccessToken(req): void hubspot.refreshAccessToken(req, res); break
    case hubspot.isGetAccessToken(req): void hubspot.getAccessToken(req, res); break
    case stripe.isCreateProduct(req): void stripe.createProduct(req, res); break
    case twilio.isCreateVerification(req): void twilio.createVerification(req, res); break
    default: fallback(req, res); break
  }
})
