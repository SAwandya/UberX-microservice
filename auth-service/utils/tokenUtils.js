const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ACCESS_TOKEN, REFRESH_TOKEN } = require("../config/jwt");

exports.generateAccessToken = (userId) => {
  return jwt.sign({ userId }, ACCESS_TOKEN.secret, {
    expiresIn: ACCESS_TOKEN.expiry,
  });
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN.secret, {
    expiresIn: REFRESH_TOKEN.expiry,
  });
};

exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN.secret);
  } catch (error) {
    return null;
  }
};

exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN.secret);
  } catch (error) {
    return null;
  }
};

exports.generateRefreshTokenHash = (refreshToken) => {
  return crypto
    .createHmac("sha256", REFRESH_TOKEN.secret)
    .update(refreshToken)
    .digest("hex");
};
