require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 4006,

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_NAME: process.env.DB_NAME || 'payment_db',

    DELIVERY_SERVICE_URL: process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3003',

    JWT_SECRET: process.env.JWT_SECRET || 'QzRYUGFBRjFGdnJWVVZzQlBJdWgrZ3lDRElnN3R2L1l3ZlI5VlBaSGVFQT0=',

    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    STRIPE_SECRET_KEY:
      process.env.STRIPE_SECRET_KEY ||
      "sk_test_51RGc1JP95UDG9o7uO7mFv88LNAYtBTy6MtBNt4uOq9AjKiYH7UnGMkvKLebG8RgecHh78VvVLDPAw9RrDFKhgHzc00br7BUebo",

    STRIPE_WEBHOOK_SECRET:
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
};