import { useCart } from '../context/CartContext.jsx'
import './ProductCardHorizontal.css'

function formatMoney(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

function excerpt(text, max = 180) {
  if (!text || typeof text !== 'string') return ''
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export default function ProductCardHorizontal({ product }) {
  const { addItem } = useCart()
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null
  const mrp = product.mrpPrice
  const price = product.discountedPrice
  const showStrike = typeof mrp === 'number' && mrp > price

  return (
    <article className="product-card-h">
      <div className="product-card-h__media">
        {image ? (
          <img
            src={image}
            alt=""
            className="product-card-h__img"
            loading="lazy"
          />
        ) : (
          <div className="product-card-h__placeholder" aria-hidden>
            No image
          </div>
        )}
      </div>
      <div className="product-card-h__body">
        <h3 className="product-card-h__title">{product.title}</h3>
        <p className="product-card-h__desc">{excerpt(product.description)}</p>
        <div className="product-card-h__row">
          <div className="product-card-h__prices">
            <span className="product-card-h__price">{formatMoney(price)}</span>
            {showStrike ? (
              <span className="product-card-h__mrp">{formatMoney(mrp)}</span>
            ) : null}
          </div>
          <button
            type="button"
            className="product-card-h__btn"
            disabled={product.inStock === false}
            onClick={() => addItem(product)}
          >
            {product.inStock === false ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
