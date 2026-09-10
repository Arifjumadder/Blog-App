import jwt from "jsonwebtoken"

/**
 * Verifies the "access_token" cookie and attaches the decoded
 * { id, role } payload to req.user. Use on any route that must
 * only be reachable by a logged-in user.
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) return res.status(401).json("Not authenticated!")

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json("Token is not valid!")
    req.user = decoded
    next()
  })
}

/**
 * Same as verifyToken, but does NOT fail the request when there is
 * no token — it just leaves req.user undefined. Useful for routes
 * that behave slightly differently for logged-in users (e.g. "did
 * I already like this post?") but are still public.
 */
export const attachUserIfPresent = (req, res, next) => {
  const token = req.cookies.access_token
  if (!token) return next()

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) req.user = decoded
    next()
  })
}

/**
 * Must be used AFTER verifyToken. Blocks the request unless the
 * logged-in user has the "admin" role.
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json("Admins only!")
  }
  next()
}
