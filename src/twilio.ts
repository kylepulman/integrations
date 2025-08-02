import dotenv from 'dotenv'
import twilio from 'twilio'
import http from 'node:http'

dotenv.config({ quiet: true })

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? ''
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? ''
const TWILIO_SMS_VERIFY_SID = process.env.TWILIO_SMS_VERIFY_SID ?? ''
const TWILIO_PHONE_NUMBER_TEST_RECIPIENT = process.env.TWILIO_PHONE_NUMBER_TEST_RECIPIENT ?? ''

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export function isCreateVerification(req: http.IncomingMessage) {
  return req.method === 'POST' && req.url === '/twilio/sms/verify'
}

export async function createVerification(_req: http.IncomingMessage, res: http.ServerResponse) {
  const verification = await client.verify.v2
    .services(TWILIO_SMS_VERIFY_SID)
    .verifications.create({
      channel: 'sms',
      to: TWILIO_PHONE_NUMBER_TEST_RECIPIENT,
    })

  res.end(verification.status)
}
