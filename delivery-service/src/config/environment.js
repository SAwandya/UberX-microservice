require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3003,

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_NAME: process.env.DB_NAME || 'delivery_service',

    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://order-service:4001',

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '1234',

    NATS_URL: process.env.NATS_URL || 'nats://localhost:4222',

    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,

    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // Add a default value for CORS_ORIGIN
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000' // Default to a safe value
};