import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import './Store.css'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await fetchCategories()
        if (!cancelled) setCategories(list)
      } catch (err) {
        if (!cancelled) {
          setCategories([])
          setError(err instanceof Error ? err.message : 'Failed to load categories')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="store-page">
      <header className="store-page__head">
        <h1 className="store-home__title">Shop by category</h1>
        <p className="store-home__sub">
          Choose a category to see products in that department.
        </p>
      </header>

      {error ? (
        <p className="store-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="store-muted">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="store-muted">No categories available yet.</p>
      ) : (
        <div className="store-category-grid">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/category/${c._id}`}
              className="store-category-card"
            >
              <h2 className="store-category-card__name">{c.title}</h2>
              <p className="store-category-card__desc">{c.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
