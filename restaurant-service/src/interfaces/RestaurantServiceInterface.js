/**
 * @interface RestaurantServiceInterface
 * Defines the contract for restaurant service operations
 */
class RestaurantServiceInterface {
    /**
     * Registers a new restaurant
     * @param {number} ownerId - The ID of the restaurant owner
     * @param {Object} payload - Restaurant details
     * @returns {Promise<Object>} - The created restaurant
     */
    async register(ownerId, payload) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets restaurants owned by a specific owner
     * @param {number} ownerId - The ID of the owner
     * @returns {Promise<Array<Object>>} - Array of restaurants
     */
    async getMine(ownerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Approves a restaurant
     * @param {number} id - The ID of the restaurant
     * @returns {Promise<Object>} - The updated restaurant
     */
    async approve(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates a restaurant
     * @param {number} id - The ID of the restaurant
     * @param {Object} data - The data to update
     * @returns {Promise<Object>} - The updated restaurant
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Deletes a restaurant
     * @param {number} id - The ID of the restaurant
     * @returns {Promise<boolean>} - Success indicator
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = RestaurantServiceInterface;