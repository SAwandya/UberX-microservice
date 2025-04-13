const mysql = require('mysql2/promise');
const config = require('./environment');
const logger = require('../utils/logger');

const dbConfig = {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
(async function testConnection() {
    try {
        const connection = await pool.getConnection();
        logger.info('Database connected successfully');
        connection.release();
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);
    }
})();

module.exports = pool;