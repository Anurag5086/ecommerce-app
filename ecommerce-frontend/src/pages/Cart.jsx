import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/orders'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import './Store.css'

function formatMoney(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, setQuantity, removeItem, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const subtotal = items.reduce(
    (s, x) => s + x.discountedPrice * x.quantity,
    0,
  )
  const productsWithQuantity = items.map((x) => ({
    productId: x.productId,
    quantity: x.quantity,
  }))

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  async function processCod() {
    if (subtotal <= 0 || productsWithQuantity.length === 0) return
    setProcessing(true)
    setError('')
    try {
      await createOrder({
        products: productsWithQuantity,
        totalAmount: subtotal,
        paymentMethod: 'COD',
      })
      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setProcessing(false)
    }
  }

  async function processRazorpay() {
    if (subtotal <= 0 || productsWithQuantity.length === 0) {
      setError('Cart is empty or total is zero.')
      return
    }
    setError('')
    setProcessing(true)
    const loaded = await loadRazorpayScript()
    if (!loaded || !window.Razorpay) {
      setProcessing(false)
      setError('Failed to load Razorpay SDK. Please check your connection.')
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RSS59NRVFBT6OO',
      amount: Math.round(subtotal * 100),
      currency: 'INR',
      name: 'Acciozon Private Limited',
      description: 'Order Payment',
      handler: async (response) => {
        try {
          await createOrder({
            products: productsWithQuantity,
            totalAmount: subtotal,
            paymentMethod: 'Razorpay',
            razorpayPaymentId: response.razorpay_payment_id,
          })
          clearCart()
          navigate('/orders')
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Payment succeeded but order creation failed',
          )
        } finally {
          setProcessing(false)
        }
      },
      prefill: { name: '', email: '', contact: '' },
      theme: { color: '#F37254' },
      modal: {
        ondismiss: () => setProcessing(false),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  async function handleCheckout() {
    if (processing) return
    if (paymentMethod === 'COD') {
      await processCod()
      return
    }
    await processRazorpay()
  }

  return (
    <div className="store-page">
      <nav className="store-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="store-breadcrumb__sep" aria-hidden>
          /
        </span>
        <span className="store-breadcrumb__current">Cart</span>
      </nav>

      <header className="store-page__head">
        <h1 className="store-page__title">Your cart</h1>
      </header>
      {error ? (
        <p className="store-error" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="store-muted">
          Your cart is empty.{' '}
          <Link to="/" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Browse categories
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="cart-lines">
            {items.map((line) => (
              <li key={line.productId} className="cart-line">
                <div className="cart-line__info">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      className="cart-line__thumb"
                    />
                  ) : (
                    <div className="cart-line__thumb cart-line__thumb--empty" />
                  )}
                  <div>
                    <p className="cart-line__title">{line.title}</p>
                    <p className="cart-line__price">
                      {formatMoney(line.discountedPrice)} each
                    </p>
                  </div>
                </div>
                <div className="cart-line__actions">
                  <label className="cart-qty">
                    <span className="visually-hidden">Quantity</span>
                    <input
                      type="number"
                      min={0}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.productId, e.target.value)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(line.productId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="cart-subtotal">
            Subtotal: <strong>{formatMoney(subtotal)}</strong>
          </p>
          <div className="cart-payment">
            <p className="cart-payment__label">Payment method</p>
            <label className="cart-payment__option">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery (COD)
            </label>
            <label className="cart-payment__option">
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === 'Razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Razorpay
            </label>
            <button
              type="button"
              className="cart-checkout"
              onClick={handleCheckout}
              disabled={processing || subtotal <= 0}
            >
              {processing
                ? 'Processing...'
                : paymentMethod === 'COD'
                  ? 'Place Order (COD)'
                  : 'Pay with Razorpay'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
