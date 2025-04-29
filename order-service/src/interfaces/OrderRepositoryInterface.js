/**
 * @interface OrderRepositoryInterface
 * Defines the contract for order data access operations
 */
class OrderRepositoryInterface {
    /**
     * Creates a new order with items
     * @param {Object} orderData - The order data to create
     * @param {Array<Object>} itemsData - The order items data
     * @returns {Promise<Object>} - The created order with ID
     */
    async createOrderWithItems(orderData, itemsData) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds an order by ID
     * @param {number} orderId - ID of the order to find
     * @returns {Promise<Object|null>} - The order or null if not found
     */
    async findOrderById(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds items belonging to an order
     * @param {number} orderId - ID of the order
     * @returns {Promise<Array<Object>>} - Array of order items
     */
    async findItemsByOrderId(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Finds the latest order for a customer
     * @param {number} customerId - ID of the customer
     * @returns {Promise<Object|null>} - The latest order or null if none found
     */
    async findLatestOrderByCustomerId(customerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Updates an order
     * @param {number} orderId - ID of the order to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object|null>} - The updated order or null if not found
     */
    async updateOrder(orderId, updateData) {
        throw new Error('Method not implemented');
    }
}

module.exports = OrderRepositoryInterface;