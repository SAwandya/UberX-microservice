/**
 * @interface RestaurantClientInterface
 * Defines the contract for other services to communicate with the restaurant service
 */
class RestaurantClientInterface {
    /**
     * Gets restaurant details
     * @param {number} restaurantId - The restaurant ID
     * @returns {Promise<Object>} - Restaurant details
     */
    async getRestaurant(restaurantId) {
        throw new Error('Method not implemented');
    }

    /**
     * Checks if a restaurant is available for orders
     * @param {number} restaurantId - The restaurant ID
     * @returns {Promise<boolean>} - Availability status
     */
    async isRestaurantAvailable(restaurantId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets restaurant menu
     * @param {number} restaurantId - The restaurant ID
     * @returns {Promise<Array<Object>>} - Menu items
     */
    async getRestaurantMenu(restaurantId) {
        throw new Error('Method not implemented');
    }

    /**
     * Validates menu items for an order
     * @param {number} restaurantId - The restaurant ID
     * @param {Array<Object>} items - Order items to validate
     * @returns {Promise<Object>} - Validation result
     */
    async validateMenuItems(restaurantId, items) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets estimated preparation time for items
     * @param {number} restaurantId - The restaurant ID
     * @param {Array<Object>} items - Order items
     * @returns {Promise<number>} - Estimated preparation time in minutes
     */
    async getEstimatedPrepTime(restaurantId, items) {
        throw new Error('Method not implemented');
    }
}

module.exports = RestaurantClientInterface;