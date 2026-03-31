import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }
      const contact = contactNumber.trim()
      const addr = address.trim()
      if (contact) payload.contactNumber = contact
      if (addr) payload.address = addr

      await registerUser(payload)
      setSuccess('Account created. You can sign in now.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Join the store with your details.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="auth-error" role="alert">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="auth-success" role="status">
              {success}
            </div>
          ) : null}

          <div className="auth-field">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="register-confirm">Confirm</label>
              <input
                id="register-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-phone">Phone (optional)</label>
            <input
              id="register-phone"
              name="contactNumber"
              type="tel"
              autoComplete="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+1 …"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-address">Address (optional)</label>
            <input
              id="register-address"
              name="address"
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, street"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
