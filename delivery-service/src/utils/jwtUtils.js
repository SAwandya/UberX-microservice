const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY } = require('../config/environment');

exports.generateAccessToken = (user) => {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};