// src/services/promotionService.js
const promotionRepo = require("../repositories/promotionRepository");
const PromotionServiceInterface = require("../interfaces/PromotionServiceInterface");

/**
 * Implementation of PromotionServiceInterface
 */
class PromotionService extends PromotionServiceInterface {
  /**
   * Validates a promotion code for a specific order context
   * @param {Object} data - Validation context data
   * @param {string} data.code - The promotion code
   * @param {number} data.userId - The user ID
   * @param {number} data.restaurantId - The restaurant ID
   * @param {number} data.cartTotal - The cart total amount
   * @returns {Promise<Object>} - Validation result
   */
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

  /**
   * Records usage of a promotion code
   * @param {Object} data - Redemption data
   * @param {string} data.code - The promotion code
   * @param {number} data.userId - The user ID
   * @param {number} data.orderId - The order ID
   * @returns {Promise<Object>} - Redemption result
   */
  async redeemPromotion({ code, userId, orderId }) {
    const promo = await promotionRepo.findByCode(code);
    if (!promo) throw new Error("Promo not found");
    await promotionRepo.incrementRedemption(promo.id, userId, orderId);
    return { success: true };
  }

  /**
   * Creates a new promotion
   * @param {Object} data - Promotion details
   * @returns {Promise<Object>} - Created promotion
   */
  async createPromotion(data) {
    return promotionRepo.createPromotion(data);
  }

  /**
   * Gets all active promotions
   * @returns {Promise<Array<Object>>} - List of active promotions
   */
  async getActivePromotions() {
    return promotionRepo.findActivePromotions();
  }

  /**
   * Gets a promotion by its code
   * @param {string} code - The promotion code
   * @returns {Promise<Object>} - Promotion details
   */
  async getPromotionByCode(code) {
    return promotionRepo.findByCode(code);
  }
}

module.exports = new PromotionService();
