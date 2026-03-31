import { getAuthToken } from './auth'

const getOrdersBase = () => {
  const env = import.meta.env.VITE_API_URL
  if (env) return `${String(env).replace(/\/$/, '')}/api/orders`
  return '/api/orders'
}

async function parseJson(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

/**
 * @param {{ page?: number; limit?: number }} params
 */
export async function fetchAdminOrders(params = {}) {
  const { page = 1, limit = 20 } = params
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const res = await fetch(`${getOrdersBase()}/admin/orders?${search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load orders')
  }
  return data
}
