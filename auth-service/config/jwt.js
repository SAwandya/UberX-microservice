module.exports = {
  ACCESS_TOKEN: {
    secret: process.env.ACCESS_TOKEN_SECRET || "access_token_secret",
    expiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  },
  REFRESH_TOKEN: {
    secret: process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret",
    expiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
};
