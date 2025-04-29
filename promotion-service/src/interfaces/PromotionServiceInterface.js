/**
 * @interface PromotionServiceInterface
 * Defines the contract for promotion service operations
 */
class PromotionServiceInterface {
    /**
     * Validates a promotion code for a specific order context
     * @param {Object} data - Validation context data
     * @param {string} data.code - The promotion code
     * @param {number} data.userId - The user ID
     * @param {number} data.restaurantId - The restaurant ID
     * @param {number} data.cartTotal - The cart total amount
     * @returns {Promise<Object>} - Validation result
     */
    async validatePromotion(data) {
        throw new Error('Method not implemented');
    }

    /**
     * Records usage of a promotion code
     * @param {Object} data - Redemption data
     * @param {string} data.code - The promotion code
     * @param {number} data.userId - The user ID
     * @param {number} data.orderId - The order ID
     * @returns {Promise<Object>} - Redemption result
     */
    async redeemPromotion(data) {
        throw new Error('Method not implemented');
    }

    /**
     * Creates a new promotion
     * @param {Object} data - Promotion details
     * @returns {Promise<Object>} - Created promotion
     */
    async createPromotion(data) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all active promotions
     * @returns {Promise<Array<Object>>} - List of active promotions
     */
    async getActivePromotions() {
        throw new Error('Method not implemented');
    }

    /**
     * Gets a promotion by its code
     * @param {string} code - The promotion code
     * @returns {Promise<Object>} - Promotion details
     */
    async getPromotionByCode(code) {
        throw new Error('Method not implemented');
    }
}

module.exports = PromotionServiceInterface;