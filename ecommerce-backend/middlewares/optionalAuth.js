const jwt = require('jsonwebtoken')

/**
 * Attaches req.user when a valid Bearer token is present; otherwise continues without auth.
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    // Invalid token: treat as unauthenticated for public routes
  }
  next()
}
