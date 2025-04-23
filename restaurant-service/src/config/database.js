const mysql = require("mysql2/promise");
const dotenv = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "order_db",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

console.log(`Order Service DB Config: Host=${dbConfig.host}, DB=${dbConfig.database}, User=${dbConfig.user}`);

const pool = mysql.createPool(dbConfig);
module.exports = pool;