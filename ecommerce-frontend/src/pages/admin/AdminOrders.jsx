import { useCallback, useEffect, useState } from 'react'
import { fetchAdminOrders } from '../../api/orders'
import './AdminOrders.css'

function formatMoney(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

function summarizeItems(products) {
  if (!Array.isArray(products) || products.length === 0) return '—'
  const parts = products.map((line) => {
    const title = line.productId?.title ?? 'Product'
    const qty = line.quantity ?? 0
    return `${title} × ${qty}`
  })
  return parts.join(', ')
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p) => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchAdminOrders({ page: p, limit: 20 })
      setOrders(Array.isArray(data.orders) ? data.orders : [])
      setTotalPages(
        typeof data.totalPages === 'number' && data.totalPages > 0
          ? data.totalPages
          : 1,
      )
    } catch (err) {
      setOrders([])
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [page, load])

  return (
    <div className="admin-orders">
      <header className="admin-orders-header">
        <h1 className="admin-orders-title">Orders</h1>
        <p className="admin-orders-subtitle">
          All orders across the store (newest first).
        </p>
      </header>

      {error ? (
        <div className="admin-orders-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-orders-table-wrap">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Payment</th>
              <th scope="col">Placed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="admin-orders-muted">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-orders-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const user = order.userId
                const customer =
                  user && typeof user === 'object'
                    ? [user.name, user.email].filter(Boolean).join(' · ')
                    : null
                return (
                  <tr key={order._id}>
                    <td>
                      <code className="admin-orders-id">
                        {String(order._id).slice(-8)}
                      </code>
                    </td>
                    <td>{customer || '—'}</td>
                    <td className="admin-orders-items">
                      {summarizeItems(order.products)}
                    </td>
                    <td>{formatMoney(order.totalAmount)}</td>
                    <td>
                      <span className="admin-orders-status">{order.status}</span>
                    </td>
                    <td>{order.paymentMethod ?? '—'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="admin-orders-pagination" aria-label="Order pages">
          <button
            type="button"
            className="admin-orders-page-btn"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="admin-orders-page-info">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="admin-orders-page-btn"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  )
}
