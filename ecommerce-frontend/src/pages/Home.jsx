import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ margin: 0 }}>Your store</h1>
      <p style={{ margin: 0, maxWidth: '32rem', color: 'var(--text)' }}>
        Browse products, manage orders, and checkout when you&apos;re ready.
      </p>
      {isAuthenticated ? (
        <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--text)' }}>
          You&apos;re signed in. Your session is saved on this device.
        </p>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: '15px' }}>
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Sign in
          </Link>{' '}
          or{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            create an account
          </Link>{' '}
          to get started.
        </p>
      )}
    </section>
  )
}
