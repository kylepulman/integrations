import http from 'node:http'

export function isGetPong(request: http.IncomingMessage) {
  return request.method === 'GET' && request.url === '/ping'
}

export function getPong(_request: http.IncomingMessage, response: http.ServerResponse) {
  response.end('pong')
}
