import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchMyProfile, updateMyProfile } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'
import './Profile.css'

export default function Profile() {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
  })

  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      setLoading(true)
      setError('')
      try {
        const user = await fetchMyProfile()
        if (cancelled) return
        setForm({
          name: user?.name || '',
          email: user?.email || '',
          contactNumber: user?.contactNumber || '',
          address: user?.address || '',
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (isAuthenticated) loadProfile()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (success) setSuccess('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const user = await updateMyProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
      })
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        contactNumber: user?.contactNumber || '',
        address: user?.address || '',
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">View and update your account details.</p>

        {error ? (
          <div className="profile-message profile-message--error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="profile-message profile-message--success">{success}</div>
        ) : null}

        {loading ? (
          <p className="profile-loading">Loading profile...</p>
        ) : (
          <form className="profile-form" onSubmit={onSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </label>

            <label>
              Contact Number
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={onChange}
              />
            </label>

            <label>
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
