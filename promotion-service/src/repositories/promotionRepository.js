// src/repositories/promotionRepository.js
const { initDB } = require("../utils/db");
const { Promotion } = require("../models/promotionModel");

class PromotionRepository {
  async findByCode(code) {
    const pool = await initDB();
    const [rows] = await pool.query("SELECT * FROM promotions WHERE code = ?", [
      code,
    ]);
    return rows.length ? new Promotion(rows[0]) : null;
  }

  async findActivePromotions() {
    const pool = await initDB();
    const now = new Date();
    const [rows] = await pool.query(
      'SELECT * FROM promotions WHERE status = "active" AND startDate <= ? AND endDate >= ?',
      [now, now]
    );
    return rows.map((row) => new Promotion(row));
  }

  async createPromotion(data) {
    const pool = await initDB();
    const [result] = await pool.query(
      `INSERT INTO promotions 
      (code, type, amount, maxDiscount, minOrderValue, startDate, endDate, usageLimit, perUserLimit, applicableRestaurants, applicableUsers, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.type,
        data.amount,
        data.maxDiscount,
        data.minOrderValue,
        data.startDate,
        data.endDate,
        data.usageLimit,
        data.perUserLimit,
        JSON.stringify(data.applicableRestaurants || []),
        JSON.stringify(data.applicableUsers || []),
        data.status || "active",
      ]
    );
    return this.findByCode(data.code);
  }

  async incrementRedemption(promoId, userId, orderId) {
    const pool = await initDB();
    await pool.query(
      "INSERT INTO promo_redemptions (promoId, userId, orderId) VALUES (?, ?, ?)",
      [promoId, userId, orderId]
    );
  }

  async countRedemptions(promoId) {
    const pool = await initDB();
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM promo_redemptions WHERE promoId = ?",
      [promoId]
    );
    return rows[0].count;
  }

  async countUserRedemptions(promoId, userId) {
    const pool = await initDB();
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM promo_redemptions WHERE promoId = ? AND userId = ?",
      [promoId, userId]
    );
    return rows[0].count;
  }
}

module.exports = new PromotionRepository();
