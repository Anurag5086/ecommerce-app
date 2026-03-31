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

function readToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)

  const isAuthenticated = Boolean(token)

  const signIn = useCallback((next) => {
    if (next) {
      localStorage.setItem(TOKEN_KEY, next)
      setToken(next)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
  }, [])

  const signOut = useCallback(() => {
    localStorage.clear()
    setToken(null)
  }, [])

  const isAdmin = useMemo(() => {
    if (!token) return false
    const payload = decodeJwtPayload(token)
    return payload?.isAdmin === true
  }, [token])

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
