import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (!isAdmin) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate, location.pathname])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return children
}
