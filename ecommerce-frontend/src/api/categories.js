import { getAuthToken } from './auth'

const getCategoriesBase = () => {
  const env = import.meta.env.VITE_API_URL
  if (env) return `${String(env).replace(/\/$/, '')}/api/categories`
  return '/api/categories'
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

export async function fetchCategories() {
  const res = await fetch(`${getCategoriesBase()}/list`, {
    headers: { ...optionalAuthHeaders() },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load categories')
  }
  return Array.isArray(data.categories) ? data.categories : []
}

/**
 * @param {string} id
 */
export async function fetchCategoryById(id) {
  const res = await fetch(`${getCategoriesBase()}/${id}`, {
    headers: { ...optionalAuthHeaders() },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load category')
  }
  return data.category
}

/**
 * @param {{ title: string; description: string }} body
 */
export async function createCategory(body) {
  const token = requireToken()
  const res = await fetch(`${getCategoriesBase()}/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create category')
  }
  return data
}

/**
 * @param {string} id
 * @param {{ title?: string; description?: string; isActive?: boolean }} body
 */
export async function updateCategory(id, body) {
  const token = requireToken()
  const res = await fetch(`${getCategoriesBase()}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update category')
  }
  return data
}

/**
 * @param {string} id
 */
export async function deleteCategory(id) {
  const token = requireToken()
  const res = await fetch(`${getCategoriesBase()}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete category')
  }
  return data
}
