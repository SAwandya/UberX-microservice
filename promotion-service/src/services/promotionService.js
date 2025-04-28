// src/services/promotionService.js
const promotionRepo = require("../repositories/promotionRepository");

class PromotionService {
  async validatePromotion({ code, userId, restaurantId, cartTotal }) {
    const promo = await promotionRepo.findByCode(code);
    if (!promo) return { valid: false, message: "Promo code not found" };

    const now = new Date();
    if (
      promo.status !== "active" ||
      now < new Date(promo.startDate) ||
      now > new Date(promo.endDate)
    ) {
      return { valid: false, message: "Promo code expired or inactive" };
    }

    if (
      promo.applicableUsers.length &&
      !promo.applicableUsers.includes(userId)
    ) {
      return { valid: false, message: "Promo code not valid for this user" };
    }

    if (
      promo.applicableRestaurants.length &&
      !promo.applicableRestaurants.includes(restaurantId)
    ) {
      return {
        valid: false,
        message: "Promo code not valid for this restaurant",
      };
    }

    if (cartTotal < promo.minOrderValue) {
      return {
        valid: false,
        message: `Minimum order value is ${promo.minOrderValue}`,
      };
    }

    const totalRedemptions = await promotionRepo.countRedemptions(promo.id);
    if (promo.usageLimit && totalRedemptions >= promo.usageLimit) {
      return { valid: false, message: "Promo usage limit reached" };
    }

    const userRedemptions = await promotionRepo.countUserRedemptions(
      promo.id,
      userId
    );
    if (promo.perUserLimit && userRedemptions >= promo.perUserLimit) {
      return { valid: false, message: "You have already used this promo" };
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === "percentage") {
      discount = (cartTotal * promo.amount) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.amount;
    }
    discount = Math.min(discount, cartTotal);

    return {
      valid: true,
      discountAmount: discount,
      newTotal: cartTotal - discount,
      message: "Promo applied!",
      promo,
    };
  }

  async redeemPromotion({ code, userId, orderId }) {
    const promo = await promotionRepo.findByCode(code);
    if (!promo) throw new Error("Promo not found");
    await promotionRepo.incrementRedemption(promo.id, userId, orderId);
    return { success: true };
  }

  async createPromotion(data) {
    return promotionRepo.createPromotion(data);
  }

  async getActivePromotions() {
    return promotionRepo.findActivePromotions();
  }

  async getPromotionByCode(code) {
    return promotionRepo.findByCode(code);
  }
}

module.exports = new PromotionService();
