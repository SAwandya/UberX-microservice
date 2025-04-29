/**
 * @interface OrderClientInterface
 * Defines the contract for other services to communicate with the order service
 */
class OrderClientInterface {
    /**
     * Retrieves an order by its ID
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} - The order details
     */
    async getOrder(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates an order from another service
     * @param {number} orderId - The order ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - The updated order
     */
    async updateOrder(orderId, updateData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets the status of an order
     * @param {number} orderId - The order ID
     * @returns {Promise<string>} - The order status
     */
    async getOrderStatus(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all orders for a customer
     * @param {number} customerId - The customer ID
     * @returns {Promise<Array<Object>>} - List of orders
     */
    async getCustomerOrders(customerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets all orders for a restaurant
     * @param {number} restaurantId - The restaurant ID
     * @returns {Promise<Array<Object>>} - List of orders
     */
    async getRestaurantOrders(restaurantId) {
        throw new Error('Method not implemented');
    }
}

module.exports = OrderClientInterface;