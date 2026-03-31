import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../../api/categories'
import './AdminCrud.css'

const emptyForm = () => ({
  title: '',
  description: '',
  isActive: true,
})

export default function AdminCategories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const list = await fetchCategories()
      setItems(list)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(cat) {
    setEditingId(cat._id)
    setForm({
      title: cat.title ?? '',
      description: cat.description ?? '',
      isActive: Boolean(cat.isActive),
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const title = form.title.trim()
      const description = form.description.trim()
      if (!title || !description) {
        setError('Title and description are required.')
        return
      }
      if (editingId) {
        await updateCategory(editingId, {
          title,
          description,
          isActive: form.isActive,
        })
      } else {
        await createCategory({ title, description })
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Products may still reference it.')) {
      return
    }
    setError('')
    try {
      await deleteCategory(id)
      if (editingId === id) cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="admin-crud">
      <header className="admin-crud-header">
        <h1 className="admin-crud-title">Categories</h1>
        <p className="admin-crud-subtitle">
          Create, update, or remove categories. Only admins can modify data.
        </p>
      </header>

      {error ? (
        <div className="admin-crud-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-crud-form-card">
        <h2 className="admin-crud-form-title">
          {editingId ? 'Edit category' : 'Add category'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-crud-fields">
            <div className="admin-crud-field">
              <label htmlFor="cat-title">Title</label>
              <input
                id="cat-title"
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
              <label htmlFor="cat-desc">Description</label>
              <textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
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
                  Active
                </label>
              </div>
            ) : null}
          </div>
          <div className="admin-crud-actions">
            <button
              type="submit"
              className="admin-crud-btn admin-crud-btn-primary"
              disabled={saving}
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
      </div>

      <div className="admin-crud-table-wrap">
        <table className="admin-crud-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Active</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-crud-muted">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-crud-muted">
                  No categories yet. Add one above.
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.title}</td>
                  <td className="admin-crud-desc-cell">{cat.description}</td>
                  <td>
                    <span className="admin-crud-badge">
                      {cat.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    {cat.updatedAt
                      ? new Date(cat.updatedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <div className="admin-crud-actions-cell">
                      <button
                        type="button"
                        className="admin-crud-btn"
                        onClick={() => startEdit(cat)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-crud-btn admin-crud-btn-danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
