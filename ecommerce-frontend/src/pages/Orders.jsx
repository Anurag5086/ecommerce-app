import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchMyOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext.jsx'
import './Orders.css'

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
  return products
    .map((line) => {
      const title = line.productId?.title ?? 'Product'
      const qty = line.quantity ?? 0
      return `${title} x ${qty}`
    })
    .join(', ')
}

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchMyOrders()
      setOrders(data)
    } catch (err) {
      setOrders([])
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadOrders()
  }, [isAuthenticated, loadOrders])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <section className="orders-page">
      <header className="orders-page__header">
        <h1 className="orders-page__title">My Orders</h1>
        <p className="orders-page__subtitle">
          All orders placed from your account.
        </p>
      </header>

      {error ? (
        <div className="orders-page__error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
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
                <td colSpan={6} className="orders-muted">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="orders-muted">
                  You have not placed any orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <code className="orders-id">{String(order._id).slice(-8)}</code>
                  </td>
                  <td className="orders-items">{summarizeItems(order.products)}</td>
                  <td>{formatMoney(order.totalAmount)}</td>
                  <td>
                    <span className="orders-status">{order.status ?? '—'}</span>
                  </td>
                  <td>{order.paymentMethod ?? '—'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
