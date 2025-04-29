/**
 * @interface TripServiceInterface
 * Defines the contract for delivery trip service operations
 */
class TripServiceInterface {
    /**
     * Creates a trip from an order
     * @param {Object} orderData - The order data
     * @param {number} orderData.id - The order ID
     * @param {number} orderData.customerId - The customer ID
     * @param {Object} orderData.startLocation - The pickup location coordinates
     * @param {Object} orderData.endLocation - The delivery location coordinates
     * @returns {Promise<Object>} - The created trip
     */
    async createTripFromOrder(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates a trip status
     * @param {number} tripId - The ID of the trip to update
     * @param {string} status - The new status
     * @returns {Promise<Object|null>} - The updated trip or null if not found
     */
    async updateTripStatus(tripId, status) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets a trip by ID
     * @param {number} tripId - The ID of the trip
     * @returns {Promise<Object|null>} - The trip or null if not found
     */
    async getTripById(tripId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets trips for a rider
     * @param {number} riderId - The ID of the rider
     * @returns {Promise<Array<Object>>} - The trips
     */
    async getTripsByRider(riderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Cancels a trip
     * @param {number} tripId - The ID of the trip to cancel
     * @param {string} reason - The reason for cancellation
     * @returns {Promise<Object|null>} - The cancelled trip or null if not found
     */
    async cancelTrip(tripId, reason) {
        throw new Error('Method not implemented');
    }
}

module.exports = TripServiceInterface;