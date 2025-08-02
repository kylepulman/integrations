export async function getAccessToken(tokenUrl: string, params: {
  code: string
  redirectUri: string
  clientId: string
  clientSecret: string
}) {
  const formData = new URLSearchParams()

  formData.set('grant_type', 'authorization_code')
  formData.set('code', params.code)
  formData.set('redirect_uri', params.redirectUri)
  formData.set('client_id', params.clientId)
  formData.set('client_secret', params.clientSecret)

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  return await response.text()
}

export async function refreshAccessToken(tokenUrl: string, params: {
  refreshToken: string
  clientId: string
  clientSecret: string
}) {
  const formData = new URLSearchParams()

  formData.set('grant_type', 'refresh_token')
  formData.set('refresh_token', params.refreshToken)
  formData.set('client_id', params.clientId)
  formData.set('client_secret', params.clientSecret)

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  return await response.json() as Record<string, unknown>
}
