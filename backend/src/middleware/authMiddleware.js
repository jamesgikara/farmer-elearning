// backend/src/middleware/authMiddleware.js
// Verifies JWT in Authorization header and attaches decoded user to req.user

const jwt = require('jsonwebtoken');

/**
 * Protect routes — requires valid Bearer token.
 */
const auth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Restrict to specific roles.
 * Usage: router.delete('/:id', auth, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden — insufficient role' });
  }
  next();
};

module.exports = { auth, requireRole };
