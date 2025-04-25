const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/environment');

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: { message: 'Unauthorized', status: 401 }
        });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: { message: 'Forbidden', status: 403 }
            });
        }
        req.user = user;
        next();
    });
};