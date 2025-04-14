const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_secret_for_local_dev';

if (!ACCESS_TOKEN_SECRET && process.env.NODE_ENV === 'production') {
    console.error("FATAL ERROR: ACCESS_TOKEN_SECRET is not defined in environment variables.");
    process.exit(1);
}

/**
 * Verifies the JWT Access Token.
 * @param {string} token - The JWT token string.
 * @returns {object | null} - The decoded payload if valid, otherwise null.
 */
const verifyAccessToken = (token) => {
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return decoded;
    } catch (error) {
        console.error('Invalid or expired token:', error.message);
        return null;
    }
};

module.exports = {
    verifyAccessToken,
};