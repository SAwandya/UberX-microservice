/**
 * @interface PromotionClientInterface
 * Defines the contract for other services to communicate with the promotion service
 */
class PromotionClientInterface {
    /**
     * Validates a promotion code 
     * @param {Object} validationData - Validation data
     * @param {string} validationData.code - The promotion code
     * @param {number} validationData.userId - User ID
     * @param {number} validationData.restaurantId - Restaurant ID
     * @param {number} validationData.cartTotal - Cart total amount
     * @returns {Promise<Object>} - Validation result with discount information
     */
    async validatePromotion(validationData) {
        throw new Error('Method not implemented');
    }

    /**
     * Redeems a promotion code
     * @param {Object} redemptionData - Redemption data
     * @param {string} redemptionData.code - The promotion code
     * @param {number} redemptionData.userId - User ID
     * @param {number} redemptionData.orderId - Order ID
     * @returns {Promise<Object>} - Redemption result
     */
    async redeemPromotion(redemptionData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets available promotions for a user
     * @param {number} userId - The user ID
     * @param {number} [restaurantId] - Optional restaurant ID to filter by
     * @returns {Promise<Array<Object>>} - Available promotions
     */
    async getAvailablePromotions(userId, restaurantId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets promotion details
     * @param {string} code - The promotion code
     * @returns {Promise<Object>} - Promotion details
     */
    async getPromotionDetails(code) {
        throw new Error('Method not implemented');
    }
}

module.exports = PromotionClientInterface;