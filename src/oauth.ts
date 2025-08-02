export async function getAccessToken(tokenUrl: string, params: {
  code: string
  redirectUri: string
  clientId: string
  clientSecret: string
}, authenticateWith: 'basicAuth' | 'formData') {
  const formData = new URLSearchParams()

  formData.set('grant_type', 'authorization_code')
  formData.set('code', params.code)
  formData.set('redirect_uri', params.redirectUri)

  let authHeader

  if (authenticateWith === 'formData') {
    formData.set('client_id', params.clientId)
    formData.set('client_secret', params.clientSecret)
  }
  else {
    authHeader = {
      Authorization: `Basic ${Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64')}`,
    }
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...authHeader,
    },
    body: formData.toString(),
  })

  return await response.text()
}

export async function refreshAccessToken(tokenUrl: string, params: {
  refreshToken: string
  clientId: string
  clientSecret: string
}, authenticateWith: 'basicAuth' | 'formData') {
  const formData = new URLSearchParams()

  formData.set('grant_type', 'refresh_token')
  formData.set('refresh_token', params.refreshToken)

  let authHeader

  if (authenticateWith === 'formData') {
    formData.set('client_id', params.clientId)
    formData.set('client_secret', params.clientSecret)
  }
  else {
    authHeader = {
      Authorization: `Basic ${Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64')}`,
    }
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...authHeader,
    },
    body: formData.toString(),
  })

  return await response.json() as Record<string, unknown>
}
