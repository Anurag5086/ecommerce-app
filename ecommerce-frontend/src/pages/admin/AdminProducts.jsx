import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCategories } from '../../api/categories'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../../api/products'
import './AdminCrud.css'

function emptyForm(defaultCategoryId = '') {
  return {
    title: '',
    description: '',
    mrpPrice: '',
    discountedPrice: '',
    categoryId: defaultCategoryId,
    inStock: true,
    imagesText: '',
    rating: '0',
    numOfReviews: '0',
    isActive: true,
  }
}

function parseImages(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatMoney(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

export default function AdminProducts() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => emptyForm())

  const categoryTitleById = useMemo(() => {
    const map = new Map()
    for (const c of categories) {
      map.set(String(c._id), c.title)
    }
    return map
  }, [categories])

  const loadCategories = useCallback(async () => {
    try {
      const list = await fetchCategories()
      setCategories(list)
    } catch {
      setCategories([])
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const list = await fetchProducts(
        filterCategoryId ? { categoryId: filterCategoryId } : {},
      )
      setProducts(list)
    } catch (err) {
      setProducts([])
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filterCategoryId])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (editingId) return
    if (categories.length === 0) return
    setForm((f) => {
      if (f.categoryId) return f
      return { ...f, categoryId: String(categories[0]._id) }
    })
  }, [categories, editingId])

  function startEdit(p) {
    setEditingId(p._id)
    const cid = p.categoryId ? String(p.categoryId) : ''
    setForm({
      title: p.title ?? '',
      description: p.description ?? '',
      mrpPrice: String(p.mrpPrice ?? ''),
      discountedPrice: String(p.discountedPrice ?? ''),
      categoryId: cid,
      inStock: Boolean(p.inStock),
      imagesText: Array.isArray(p.images) ? p.images.join('\n') : '',
      rating: String(p.rating ?? '0'),
      numOfReviews: String(p.numOfReviews ?? '0'),
      isActive: Boolean(p.isActive),
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm(categories[0]?._id ? String(categories[0]._id) : ''))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const title = form.title.trim()
    const description = form.description.trim()
    const categoryId = form.categoryId
    const mrpPrice = Number(form.mrpPrice)
    const discountedPrice = Number(form.discountedPrice)
    const rating = Number(form.rating)
    const numOfReviews = Number(form.numOfReviews)

    if (!title || !description) {
      setError('Title and description are required.')
      return
    }
    if (!categoryId) {
      setError('Select a category.')
      return
    }
    if (
      Number.isNaN(mrpPrice) ||
      Number.isNaN(discountedPrice) ||
      mrpPrice < 0 ||
      discountedPrice < 0
    ) {
      setError('Enter valid prices (0 or greater).')
      return
    }
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      setError('Rating must be between 0 and 5.')
      return
    }
    if (Number.isNaN(numOfReviews) || numOfReviews < 0) {
      setError('Number of reviews must be 0 or greater.')
      return
    }

    const images = parseImages(form.imagesText)
    const payload = {
      title,
      description,
      mrpPrice,
      discountedPrice,
      categoryId,
      inStock: form.inStock,
      images,
      rating,
      numOfReviews,
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateProduct(editingId, { ...payload, isActive: form.isActive })
      } else {
        await createProduct(payload)
      }
      cancelEdit()
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    setError('')
    try {
      await deleteProduct(id)
      if (editingId === id) cancelEdit()
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="admin-crud">
      <header className="admin-crud-header">
        <h1 className="admin-crud-title">Products</h1>
        <p className="admin-crud-subtitle">
          Manage catalog items. Create a category before adding products.
        </p>
      </header>

      {error ? (
        <div className="admin-crud-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-crud-form-card">
        <h2 className="admin-crud-form-title">
          {editingId ? 'Edit product' : 'Add product'}
        </h2>
        {categories.length === 0 ? (
          <p className="admin-crud-subtitle">
            No categories available. Add a category under Categories first.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="admin-crud-fields">
              <div className="admin-crud-field">
                <label htmlFor="p-title">Title</label>
                <input
                  id="p-title"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  autoComplete="off"
                />
              </div>
              <div className="admin-crud-field">
                <label htmlFor="p-desc">Description</label>
                <textarea
                  id="p-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="admin-crud-fields admin-crud-fields--two">
                <div className="admin-crud-field">
                  <label htmlFor="p-cat">Category</label>
                  <select
                    id="p-cat"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categoryId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={String(c._id)}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-crud-field admin-crud-field--checkbox-row">
                  <label className="admin-crud-check">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, inStock: e.target.checked }))
                      }
                    />
                    In stock
                  </label>
                </div>
              </div>
              <div className="admin-crud-fields admin-crud-fields--two">
                <div className="admin-crud-field">
                  <label htmlFor="p-mrp">MRP</label>
                  <input
                    id="p-mrp"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.mrpPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mrpPrice: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-crud-field">
                  <label htmlFor="p-price">Discounted price</label>
                  <input
                    id="p-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.discountedPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountedPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="admin-crud-fields admin-crud-fields--two">
                <div className="admin-crud-field">
                  <label htmlFor="p-rating">Rating (0–5)</label>
                  <input
                    id="p-rating"
                    type="number"
                    min={0}
                    max={5}
                    step="0.1"
                    value={form.rating}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rating: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-crud-field">
                  <label htmlFor="p-reviews">Number of reviews</label>
                  <input
                    id="p-reviews"
                    type="number"
                    min={0}
                    step={1}
                    value={form.numOfReviews}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, numOfReviews: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="admin-crud-field">
                <label htmlFor="p-images">Image URLs (one per line)</label>
                <textarea
                  id="p-images"
                  className="admin-crud-textarea--images"
                  value={form.imagesText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imagesText: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </div>
              {editingId ? (
                <div className="admin-crud-field">
                  <label className="admin-crud-check">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                    />
                    Active (visible in store)
                  </label>
                </div>
              ) : null}
            </div>
            <div className="admin-crud-actions">
              <button
                type="submit"
                className="admin-crud-btn admin-crud-btn-primary"
                disabled={saving || categories.length === 0}
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="admin-crud-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        )}
      </div>

      <div className="admin-crud-filter">
        <label htmlFor="p-filter-cat">Filter by category</label>
        <select
          id="p-filter-cat"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={String(c._id)}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-crud-table-wrap">
        <table className="admin-crud-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Category</th>
              <th scope="col">Prices</th>
              <th scope="col">Stock</th>
              <th scope="col">Active</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-crud-muted">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-crud-muted">
                  No products in this view. Add one above or change the filter.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const catKey = p.categoryId ? String(p.categoryId) : ''
                return (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{categoryTitleById.get(catKey) ?? '—'}</td>
                    <td>
                      <div>{formatMoney(p.mrpPrice)} MRP</div>
                      <div>{formatMoney(p.discountedPrice)} sale</div>
                    </td>
                    <td>
                      <span className="admin-crud-badge">
                        {p.inStock ? 'In stock' : 'Out'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-crud-badge">
                        {p.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-crud-actions-cell">
                        <button
                          type="button"
                          className="admin-crud-btn"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-crud-btn admin-crud-btn-danger"
                          onClick={() => handleDelete(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
