const db = require("../config/database");
const User = require("../models/user");
const { convertDate } = require("../utils/dateUtils");

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
  
  const convertedexpire = convertDate(expire);

  try {
    await db.execute(
      "INSERT INTO refresh_tokens (userId, token, token_hash, expires_at) VALUES (?, ?, ?, ?)",
      [userId, tokenHash, token, convertedexpire]
    );
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.findRefreshToken = async (userId, tokenHash) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM refresh_tokens WHERE user_id = ? AND token_hash = ?",
      [userId, tokenHash]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.deleteRefreshToken = async (userId, tokenHash) => {
  try {
    await db.execute(
      "DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?",
      [userId, tokenHash]
    );
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

exports.deleteAllRefreshTokens = async (userId) => {
  try {
    await db.execute("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
    return true;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};
