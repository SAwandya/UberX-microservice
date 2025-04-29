/**
 * @interface DeliveryServiceInterface
 * Defines the contract for delivery service operations
 */
class DeliveryServiceInterface {
    /**
     * Creates a new delivery record from order data
     * @param {Object} orderData - Order data with delivery details
     * @returns {Promise<Object>} - Created delivery details
     */
    async createDeliveryFromOrder(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets a delivery record by ID
     * @param {number} deliveryId - The delivery ID
     * @returns {Promise<Object>} - Delivery details
     */
    async getDeliveryById(deliveryId) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates the status of a delivery
     * @param {number} deliveryId - The delivery ID
     * @param {string} status - New status
     * @returns {Promise<Object>} - Updated delivery details
     */
    async updateDeliveryStatus(deliveryId, status) {
        throw new Error('Method not implemented');
    }

    /**
     * Assigns a rider to a delivery
     * @param {number} deliveryId - The delivery ID
     * @param {number} riderId - The rider ID
     * @returns {Promise<Object>} - Updated delivery details
     */
    async assignRider(deliveryId, riderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all deliveries for a customer
     * @param {number} customerId - The customer ID
     * @returns {Promise<Array<Object>>} - List of deliveries
     */
    async getDeliveriesForCustomer(customerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all active deliveries for a rider
     * @param {number} riderId - The rider ID
     * @returns {Promise<Array<Object>>} - List of active deliveries
     */
    async getActiveDeliveriesForRider(riderId) {
        throw new Error('Method not implemented');
    }
}

module.exports = DeliveryServiceInterface;