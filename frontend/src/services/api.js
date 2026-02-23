const BASE_URL = '/api'

function getToken() {
  return localStorage.getItem('jwt_token')
}

function setToken(token) {
  localStorage.setItem('jwt_token', token)
}

function removeToken() {
  localStorage.removeItem('jwt_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Erreur ${res.status}`)
  }

  return data
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.access_token)
  return data
}

export function logout() {
  removeToken()
}

export async function getMe() {
  return request('/auth/me')
}

export async function fetchOTs() {
  return request('/ots')
}

export async function createOT(payload) {
  return request('/ots', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateOT(id, payload) {
  return request(`/ots/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteOT(id) {
  return request(`/ots/${id}`, { method: 'DELETE' })
}

export async function validateMEP(id) {
  return request(`/ots/${id}/mep`, { method: 'POST' })
}

export async function cancelMEP(id) {
  return request(`/ots/${id}/mep`, { method: 'DELETE' })
}

export { getToken }
