import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

const SIDEBAR_ITEMS = [
  { to: 'orders', label: 'Orders' },
  { to: 'category', label: 'Category' },
  { to: 'products', label: 'Products' },
]

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Dashboard</p>
        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          <ul className="admin-sidebar-list">
            {SIDEBAR_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? 'admin-sidebar-link admin-sidebar-link-active'
                      : 'admin-sidebar-link'
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className="admin-main" aria-label="Admin content">
        <Outlet />
      </section>
    </div>
  )
}
