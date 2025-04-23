const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../environment');
exports.authenticate = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: { message: 'Missing Authorization header', status: 401 } });
  const token = h.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: { message: 'Invalid token', status: 401 } });
  }
};
exports.authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ error: { message: 'Forbidden', status: 403 } });
  next();
};