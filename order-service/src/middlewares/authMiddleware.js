const { verifyAccessToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        console.log('Authentication middleware: No token provided');
        return next(); // Or return res.status(401).json({ message: 'No token provided' }); if user MUST be identified
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
        console.log('Authentication middleware: Invalid or expired token');
        // Nginx auth_request should ideally catch this, but as a safeguard:
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = {
        id: decoded.userId,
        // Add other fields from token if needed (e.g., role)
    };
    console.log(`Authentication middleware: User ${req.user.id} authenticated.`);

    next();
};

module.exports = {
    authenticate,
};