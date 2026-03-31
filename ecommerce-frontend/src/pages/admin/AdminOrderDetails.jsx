import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrderById, updateOrderStatus } from '../../api/orders'
import './AdminOrderDetails.css'

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

export default function AdminOrderDetails() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchOrderById(orderId)
        if (cancelled) return
        setOrder(data)
        setStatus(data.status ?? 'Pending')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load order')
          setOrder(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (orderId) load()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const customer = useMemo(() => {
    const user = order?.userId
    if (!user || typeof user !== 'object') return '—'
    return [user.name, user.email, user.contactNumber, user.address]
      .filter(Boolean)
      .join(' · ')
  }, [order])

  async function onUpdateStatus() {
    if (!order?._id || status === order.status) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateOrderStatus(order._id, status)
      setOrder((prev) => (prev ? { ...prev, ...updated } : prev))
      setStatus(updated.status ?? status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-order-details">
      <div className="admin-order-details__top">
        <Link to="/admin/orders" className="admin-order-details__back">
          ← Back to orders
        </Link>
        <h1 className="admin-order-details__title">Order Details</h1>
      </div>

      {error ? (
        <div className="admin-order-details__error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="admin-order-details__muted">Loading order…</p>
      ) : !order ? (
        <p className="admin-order-details__muted">Order not found.</p>
      ) : (
        <>
          <div className="admin-order-details__grid">
            <article className="admin-order-card">
              <h2>Order Info</h2>
              <p>
                <strong>ID:</strong> <code>{order._id}</code>
              </p>
              <p>
                <strong>Placed:</strong> {formatDate(order.createdAt)}
              </p>
              <p>
                <strong>Payment:</strong> {order.paymentMethod ?? '—'}
              </p>
              <p>
                <strong>Total:</strong> {formatMoney(order.totalAmount)}
              </p>
            </article>

            <article className="admin-order-card">
              <h2>Customer</h2>
              <p>{customer}</p>
            </article>
          </div>

          <article className="admin-order-card">
            <h2>Status</h2>
            <div className="admin-order-status-edit">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onUpdateStatus}
                disabled={saving || status === order.status}
              >
                {saving ? 'Saving…' : 'Update status'}
              </button>
            </div>
          </article>

          <article className="admin-order-card">
            <h2>Products</h2>
            <ul className="admin-order-lines">
              {(order.products ?? []).map((line, idx) => {
                const p = line.productId
                return (
                  <li
                    key={line._id ?? `${line.productId?._id ?? idx}-${line.quantity ?? 0}`}
                    className="admin-order-line"
                  >
                    <div className="admin-order-line__head">
                      <strong>{p?.title ?? 'Product'}</strong>
                      <span>Qty: {line.quantity ?? 0}</span>
                    </div>
                    <p className="admin-order-line__meta">
                      Product ID: <code>{p?._id ?? line.productId}</code>
                    </p>
                    {p?.description ? (
                      <p className="admin-order-line__desc">{p.description}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </article>
        </>
      )}
    </section>
  )
}
