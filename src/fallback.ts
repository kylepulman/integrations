import http from 'node:http'

export default function fallback(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  res.statusCode = 404
  res.end('Not Found')
}
