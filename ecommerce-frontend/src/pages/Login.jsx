import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, loginWithGoogle } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser({ email: email.trim(), password })
      if (data.token) signIn(data.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError('Google login failed: missing credential token')
      return
    }

    setError('')
    setGoogleLoading(true)
    try {
      const data = await loginWithGoogle({ token: credentialResponse.credential })
      if (data.token) signIn(data.token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="subtitle">Welcome back. Use your email and password.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="auth-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {isGoogleEnabled ? (
            <div className="auth-google-wrap" aria-live="polite">
              {googleLoading ? <p className="auth-google-loading">Signing in with Google…</p> : null}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
                text="signin_with"
                theme="outline"
                size="large"
                width="364"
              />
            </div>
          ) : null}
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
