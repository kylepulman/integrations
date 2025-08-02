import http from 'node:http'
import Stripe from 'stripe'

const STRIPE_SK = process.env.STRIPE_SK ?? ''

const client = new Stripe(STRIPE_SK)

export function isCreateProduct(req: http.IncomingMessage) {
  return req.method === 'POST' && req.url === '/stripe/products/create'
}

export async function createProduct(_request: http.IncomingMessage, response: http.ServerResponse) {
  const product = await client.products.create({
    name: 'Test Subscription One',
  })

  const price = await client.prices.create({
    unit_amount: 1200,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
  })

  response.end(`New product "${product.name}" created with a cost of $${(Number(price.unit_amount) / 100).toFixed(2)} per ${price.recurring?.interval ?? 'unit'}.`)
}
