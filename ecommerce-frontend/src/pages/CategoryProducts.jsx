import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCategoryById } from '../api/categories'
import { fetchProducts } from '../api/products'
import ProductCardHorizontal from '../components/ProductCardHorizontal.jsx'
import './Store.css'

export default function CategoryProducts() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [cat, list] = await Promise.all([
          fetchCategoryById(categoryId),
          fetchProducts({ categoryId }),
        ])
        if (cancelled) return
        setCategory(cat)
        setProducts(list)
      } catch (err) {
        if (cancelled) return
        setCategory(null)
        setProducts([])
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (categoryId) load()
    return () => {
      cancelled = true
    }
  }, [categoryId])

  return (
    <div className="store-page">
      <nav className="store-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="store-breadcrumb__sep" aria-hidden>
          /
        </span>
        <span className="store-breadcrumb__current">
          {category?.title ?? 'Category'}
        </span>
      </nav>

      <header className="store-page__head">
        <h1 className="store-page__title">
          {loading ? 'Loading…' : category?.title ?? 'Products'}
        </h1>
        {category?.description ? (
          <p className="store-page__sub">{category.description}</p>
        ) : null}
      </header>

      {error ? (
        <p className="store-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="store-muted">Loading products…</p>
      ) : !error && products.length === 0 ? (
        <p className="store-muted">No products in this category yet.</p>
      ) : (
        <ul className="store-product-list">
          {products.map((p) => (
            <li key={p._id}>
              <ProductCardHorizontal product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
