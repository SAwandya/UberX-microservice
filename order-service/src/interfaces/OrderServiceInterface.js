/**
 * @interface OrderServiceInterface
 * Defines the contract for order service operations
 */
class OrderServiceInterface {
    /**
     * Creates a new order
     * @param {number} customerId - The ID of the customer placing the order
     * @param {Object} orderDetails - Order details including items, restaurantId, etc.
     * @returns {Promise<Object>} - The created order
     */
    async createOrder(customerId, orderDetails) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets the latest order for a customer
     * @param {number} customerId - The ID of the customer
     * @returns {Promise<Object>} - The latest order
     */
    async getLatestOrderForCustomer(customerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets an order by its ID
     * @param {number} orderId - The ID of the order
     * @returns {Promise<Object>} - The order
     */
    async getOrderById(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates an order
     * @param {number} orderId - The ID of the order
     * @param {Object} updateData - Data to update
     * @param {number} [requesterId] - ID of the user making the request (optional)
     * @param {boolean} [isServiceUpdate=false] - Whether update is from internal service
     * @returns {Promise<Object>} - The updated order
     */
    async updateOrder(orderId, updateData, requesterId, isServiceUpdate = false) {
        throw new Error('Method not implemented');
    }
}

module.exports = OrderServiceInterface;