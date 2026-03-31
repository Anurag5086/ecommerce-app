import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function AppHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, signOut } = useAuth()

  function handleLogout() {
    signOut()
    navigate('/')
  }

  return (
    <header className="app-header">
      <NavLink to="/" className="app-brand" end>
        Store
      </NavLink>
      <nav className="app-nav">
        {isAuthenticated ? (
          <button
            type="button"
            className="app-nav-link app-nav-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
            >
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

function App() {
  return (
    <>
      <AppHeader />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="category" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default App
