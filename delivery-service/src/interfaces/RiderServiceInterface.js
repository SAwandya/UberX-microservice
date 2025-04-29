/**
 * @interface RiderServiceInterface
 * Defines the contract for rider service operations
 */
class RiderServiceInterface {
    /**
     * Creates a new rider
     * @param {Object} riderData - The rider data
     * @returns {Promise<Object>} - The created rider
     */
    async createRider(riderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets a rider by ID
     * @param {number} riderId - The rider ID
     * @returns {Promise<Object|null>} - The rider or null if not found
     */
    async getRiderById(riderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates a rider's availability
     * @param {number} riderId - The rider ID
     * @param {boolean} isAvailable - The availability status
     * @returns {Promise<Object|null>} - The updated rider or null if not found
     */
    async updateRiderAvailability(riderId, isAvailable) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all available riders
     * @returns {Promise<Array<Object>>} - Array of available riders
     */
    async getAvailableRiders() {
        throw new Error('Method not implemented');
    }
}

module.exports = RiderServiceInterface;