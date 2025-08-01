import http from 'node:http'
import dotenv from 'dotenv'

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
  } else {
    console.error(error)
  }
  process.exit(1)
})

server.on('request', (request, response) => {
  switch (true) {
    case request.method === 'GET' && request.url === '/ping':
      response.end('pong')
      break
    default:
      response.statusCode = 404
      response.end('Not Found')
      break
  }
})
