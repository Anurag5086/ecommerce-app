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

export async function fetchMyOrders() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const res = await fetch(`${getOrdersBase()}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load orders')
  }
  return Array.isArray(data) ? data : []
}

/**
 * @param {{
 *   products: Array<{ productId: string; quantity: number }>;
 *   totalAmount: number;
 *   paymentMethod: 'COD' | 'Razorpay';
 *   razorpayPaymentId?: string;
 * }} body
 */
export async function createOrder(body) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const res = await fetch(`${getOrdersBase()}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create order')
  }
  return data
}

/**
 * @param {string} id
 * @param {'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'} status
 */
export async function updateOrderStatus(id, status) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const res = await fetch(`${getOrdersBase()}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update order status')
  }
  return data
}

/**
 * @param {string} id
 */
export async function fetchOrderById(id) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const res = await fetch(`${getOrdersBase()}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load order')
  }
  return data
}
