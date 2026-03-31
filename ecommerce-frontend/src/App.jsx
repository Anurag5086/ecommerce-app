import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/CartContext.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminOrderDetails from './pages/admin/AdminOrderDetails.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import Cart from './pages/Cart.jsx'
import CategoryProducts from './pages/CategoryProducts.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register'
import './App.css'

function AppHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, signOut } = useAuth()
  const { totalCount } = useCart()

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
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? 'app-nav-link active' : 'app-nav-link'
          }
        >
          Cart{totalCount > 0 ? ` (${totalCount})` : ''}
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
            >
              My Orders
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
            >
              Profile
            </NavLink>
            <button
              type="button"
              className="app-nav-link app-nav-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
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
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
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
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
            <Route path="category" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default App
