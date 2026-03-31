import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminOrders, updateOrderStatus } from '../../api/orders'
import './AdminOrders.css'

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

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
  if (parts.length <= 2) return parts.join(', ')
  return `${parts.slice(0, 2).join(', ')} +${parts.length - 2} more`
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingStatusById, setPendingStatusById] = useState({})
  const [savingById, setSavingById] = useState({})

  const load = useCallback(async (p) => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchAdminOrders({ page: p, limit: 20 })
      const nextOrders = Array.isArray(data.orders) ? data.orders : []
      setOrders(nextOrders)
      setPendingStatusById(
        Object.fromEntries(
          nextOrders.map((order) => [order._id, order.status ?? 'Pending']),
        ),
      )
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

  async function handleUpdateStatus(orderId) {
    const status = pendingStatusById[orderId]
    if (!status) return
    setSavingById((prev) => ({ ...prev, [orderId]: true }))
    setError('')
    try {
      const updated = await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, ...updated } : order)),
      )
      setPendingStatusById((prev) => ({
        ...prev,
        [orderId]: updated.status ?? status,
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update order status',
      )
    } finally {
      setSavingById((prev) => ({ ...prev, [orderId]: false }))
    }
  }

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
              <th scope="col">Update Status</th>
              <th scope="col">Payment</th>
              <th scope="col">Placed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="admin-orders-muted">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-orders-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const user = order.userId
                const customer =
                  user && typeof user === 'object'
                    ? [user.name, user.email, user.contactNumber, user.address]
                        .filter(Boolean)
                        .join(' · ')
                    : null
                const itemsSummary = summarizeItems(order.products)
                return (
                  <tr key={order._id}>
                    <td>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="admin-orders-id-link"
                      >
                        <code className="admin-orders-id">
                          {String(order._id).slice(-8)}
                        </code>
                      </Link>
                    </td>
                    <td>{customer || '—'}</td>
                    <td className="admin-orders-items" title={itemsSummary}>
                      {itemsSummary}
                    </td>
                    <td>{formatMoney(order.totalAmount)}</td>
                    <td>
                      <span className="admin-orders-status">{order.status}</span>
                    </td>
                    <td>
                      <div className="admin-orders-status-edit">
                        <select
                          className="admin-orders-status-select"
                          value={pendingStatusById[order._id] ?? order.status ?? 'Pending'}
                          onChange={(e) =>
                            setPendingStatusById((prev) => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                          disabled={Boolean(savingById[order._id])}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="admin-orders-update-btn"
                          disabled={
                            Boolean(savingById[order._id]) ||
                            (pendingStatusById[order._id] ?? order.status) === order.status
                          }
                          onClick={() => handleUpdateStatus(order._id)}
                        >
                          {savingById[order._id] ? 'Saving…' : 'Update'}
                        </button>
                      </div>
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
