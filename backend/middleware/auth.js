const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'No token provided. Access Denied.' });

  try {
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ error: 'Malformed authorization header.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.userId = decoded.id;
    
    // Attach user record for role-based checks
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'isPro']
    });
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] clearance. Your current role is '${req.user.role}'.` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
