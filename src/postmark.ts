import http from 'node:http'
import postmark from 'postmark'

const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN ?? ''
const POSTMARK_FROM = process.env.POSTMARK_FROM ?? ''
const client = new postmark.ServerClient(POSTMARK_API_TOKEN)

export function isSendEmail(request: http.IncomingMessage) {
  return request.method === 'POST' && request.url === '/postmark/broadcast/send'
}

export async function sendEmail(
  _request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const result = await client.sendEmail({
    From: POSTMARK_FROM,
    To: POSTMARK_FROM,
    Subject: 'Send Email Test',
    HtmlBody: '<p>Hello, from Postmark!</p>',
    TextBody: 'Hello, from Postmark!',
    MessageStream: 'broadcast',
  })

  response.end(JSON.stringify(result))
}
