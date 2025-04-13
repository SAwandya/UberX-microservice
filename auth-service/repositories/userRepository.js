const db = require("../config/database");
const User = require("../models/user");
const { convertDate } = require("../utils/dateUtils"); // Corrected typo: dataUtils -> dateUtils

exports.findByUsername = async (username) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) return null;

    const user = rows[0];
    return new User(user.id, user.username, user.email, user.password);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.findById = async (id) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) return null;

    const user = rows[0];
    return new User(user.id, user.username, user.email, user.password);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.createUser = async (user) => {
  try {
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [user.username, user.email, user.password]
    );

    return { ...user, id: result.insertId };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.saveRefreshToken = async (userId, tokenHash, token, expire) => {
  const convertedexpire = convertDate(expire); // Pass the 'expire' variable

  try {
    // FIX 2: Corrected the order of values to match INSERT columns
    await db.execute(
      "INSERT INTO refresh_tokens (userId, token, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [userId, token, tokenHash, convertedexpire] // Swapped token and tokenHash
    );
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.findRefreshToken = async (userId, tokenHash) => {
  try {
    // FIX 1: Changed user_id to userId
    const [rows] = await db.execute(
      "SELECT * FROM refresh_tokens WHERE userId = ? AND token_hash = ?", // Corrected column name
      [userId, tokenHash]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.deleteRefreshToken = async (userId, tokenHash) => {
  try {
    // FIX 1: Changed user_id to userId
    await db.execute(
      "DELETE FROM refresh_tokens WHERE userId = ? AND token_hash = ?", // Corrected column name
      [userId, tokenHash]
    );
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.deleteAllRefreshTokens = async (userId) => {
  try {
    // FIX 1: Changed user_id to userId
    await db.execute("DELETE FROM refresh_tokens WHERE userId = ?", [userId]); // Corrected column name
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};