// src/controllers/promotionController.js
const promotionService = require("../services/promotionService");

exports.validatePromotion = async (req, res) => {
  try {
    const result = await promotionService.validatePromotion(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
};

exports.redeemPromotion = async (req, res) => {
  try {
    await promotionService.redeemPromotion(req.body);
    res.status(200).json({ success: true, message: "Promo redeemed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promo = await promotionService.createPromotion(req.body);
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivePromotions = async (req, res) => {
  try {
    const promos = await promotionService.getActivePromotions();
    res.status(200).json(promos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPromotionByCode = async (req, res) => {
  try {
    const promo = await promotionService.getPromotionByCode(req.params.code);
    if (!promo) return res.status(404).json({ message: "Not found" });
    res.status(200).json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
