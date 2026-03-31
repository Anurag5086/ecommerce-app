import { getAuthToken } from './auth'

const getProductsBase = () => {
  const env = import.meta.env.VITE_API_URL
  if (env) return `${String(env).replace(/\/$/, '')}/api/products`
  return '/api/products'
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

function requireToken() {
  const token = getAuthToken()
  if (!token) throw new Error('Not signed in')
  return token
}

function optionalAuthHeaders() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * @param {{ categoryId?: string }} [params]
 */
export async function fetchProducts(params = {}) {
  const search = new URLSearchParams()
  if (params.categoryId) search.set('categoryId', params.categoryId)
  const qs = search.toString()
  const url = `${getProductsBase()}/list${qs ? `?${qs}` : ''}`
  const res = await fetch(url, {
    headers: { ...optionalAuthHeaders() },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load products')
  }
  return Array.isArray(data.products) ? data.products : []
}

/**
 * @param {string} id
 */
export async function fetchProductById(id) {
  const res = await fetch(`${getProductsBase()}/${id}`, {
    headers: { ...optionalAuthHeaders() },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load product')
  }
  return data.product
}

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   mrpPrice: number;
 *   discountedPrice: number;
 *   categoryId: string;
 *   inStock?: boolean;
 *   images?: string[];
 *   rating?: number;
 *   numOfReviews?: number;
 * }} body
 */
export async function createProduct(body) {
  const token = requireToken()
  const res = await fetch(`${getProductsBase()}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create product')
  }
  return data
}

/**
 * @param {string} id
 * @param {{
 *   title?: string;
 *   description?: string;
 *   mrpPrice?: number;
 *   discountedPrice?: number;
 *   categoryId?: string;
 *   inStock?: boolean;
 *   images?: string[];
 *   rating?: number;
 *   numOfReviews?: number;
 *   isActive?: boolean;
 * }} body
 */
export async function updateProduct(id, body) {
  const token = requireToken()
  const res = await fetch(`${getProductsBase()}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update product')
  }
  return data
}

/**
 * @param {string} id
 */
export async function deleteProduct(id) {
  const token = requireToken()
  const res = await fetch(`${getProductsBase()}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete product')
  }
  return data
}
