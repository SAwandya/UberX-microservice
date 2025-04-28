// src/utils/db.js
const mysql = require("mysql2/promise");
const env = require("../config/environment");

let pool;

const initDB = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

module.exports = { initDB };
