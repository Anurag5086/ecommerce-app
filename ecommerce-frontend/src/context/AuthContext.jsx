/* eslint-disable react-refresh/only-export-components -- context + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { TOKEN_KEY } from '../api/auth'
import { decodeJwtPayload } from '../utils/jwt'

const AuthContext = createContext(null)

function readHasToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readHasToken)

  const signIn = useCallback((token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setIsAuthenticated(Boolean(token))
  }, [])

  const signOut = useCallback(() => {
    localStorage.clear()
    setIsAuthenticated(false)
  }, [])

  const isAdmin = useMemo(() => {
    if (!isAuthenticated) return false
    const token = localStorage.getItem(TOKEN_KEY)
    const payload = decodeJwtPayload(token)
    return payload?.isAdmin === true
  }, [isAuthenticated])

  const value = useMemo(
    () => ({ isAuthenticated, isAdmin, signIn, signOut }),
    [isAuthenticated, isAdmin, signIn, signOut],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
