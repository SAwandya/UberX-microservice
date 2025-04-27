const mysql = require("mysql2/promise");
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "delivery_db",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

console.log(`Delivery Service DB Config: Host=${dbConfig.host}, DB=${dbConfig.database}, User=${dbConfig.user}`);

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to the Delivery database.");
        connection.release();
    } catch (err) {
        console.error("Error connecting to the Delivery database:", err.message);
    }
}

testConnection();

module.exports = pool;