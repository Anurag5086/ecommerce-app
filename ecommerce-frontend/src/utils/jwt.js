/**
 * Decodes the JWT payload (middle segment) without verifying the signature.
 * Used only for client-side UI (e.g. admin routes); authorization must still be enforced on the server.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}
