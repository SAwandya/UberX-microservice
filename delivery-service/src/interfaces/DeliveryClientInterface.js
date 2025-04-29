/**
 * @interface DeliveryClientInterface
 * Defines the contract for other services to communicate with the delivery service
 */
class DeliveryClientInterface {
    /**
     * Creates a delivery for an order
     * @param {Object} orderData - Order data with delivery details
     * @returns {Promise<Object>} - Created delivery details
     */
    async createDelivery(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets the status of a delivery
     * @param {number} deliveryId - The delivery ID
     * @returns {Promise<string>} - Delivery status
     */
    async getDeliveryStatus(deliveryId) {
        throw new Error('Method not implemented');
    }

    /**
     * Cancels a delivery
     * @param {number} deliveryId - The delivery ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} - Cancellation result
     */
    async cancelDelivery(deliveryId, reason) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets estimated delivery time
     * @param {number} deliveryId - The delivery ID
     * @returns {Promise<Object>} - Estimated delivery time details
     */
    async getEstimatedDeliveryTime(deliveryId) {
        throw new Error('Method not implemented');
    }

    /**
     * Tracks a delivery
     * @param {number} deliveryId - The delivery ID
     * @returns {Promise<Object>} - Current location and status information
     */
    async trackDelivery(deliveryId) {
        throw new Error('Method not implemented');
    }
}

module.exports = DeliveryClientInterface;