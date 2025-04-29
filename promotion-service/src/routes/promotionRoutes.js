const express = require("express");
const ctrl = require("../controllers/promotionController");

const router = express.Router();

router.post("/validate", ctrl.validatePromotion);
router.post("/redeem", ctrl.redeemPromotion);
router.post("/", ctrl.createPromotion);
router.get("/active", ctrl.getActivePromotions);
router.get("/:code", ctrl.getPromotionByCode);

module.exports = router;
