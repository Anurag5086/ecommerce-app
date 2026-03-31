/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'store_cart_v1'

const CartContext = createContext(null)

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @typedef {{ productId: string; title: string; image?: string; discountedPrice: number; quantity: number }} CartItem
 */

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadStored())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const addItem = useCallback((product) => {
    const id = String(product._id ?? product.id)
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === id)
      const image =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : undefined
      const line = {
        productId: id,
        title: product.title,
        image,
        discountedPrice: Number(product.discountedPrice) || 0,
        quantity: 1,
      }
      if (idx === -1) return [...prev, line]
      const next = [...prev]
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
      return next
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== String(productId)))
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    const q = Math.max(0, Math.floor(Number(quantity) || 0))
    setItems((prev) => {
      if (q === 0) return prev.filter((x) => x.productId !== String(productId))
      return prev.map((x) =>
        x.productId === String(productId) ? { ...x, quantity: q } : x,
      )
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalCount = useMemo(
    () => items.reduce((s, x) => s + x.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      totalCount,
    }),
    [items, addItem, removeItem, setQuantity, clearCart, totalCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
