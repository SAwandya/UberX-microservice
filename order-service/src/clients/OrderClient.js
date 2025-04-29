const axios = require('axios');
const OrderClientInterface = require('../interfaces/OrderClientInterface');

/**
 * Concrete implementation of OrderClientInterface for inter-service communication
 */
class OrderClient extends OrderClientInterface {
    constructor() {
        super();
        this.baseUrl = process.env.ORDER_SERVICE_URL || 'http://order-service.uberx-order.svc.cluster.local:4001/api/orders';
        this.serviceToken = process.env.INTERNAL_SERVICE_TOKEN || 'internal-service-token';
    }

    /**
     * Sets up common headers for service-to-service communication
     * @returns {Object} - Headers object
     * @private
     */
    _getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-service-token': this.serviceToken
        };
    }

    /**
     * Retrieves an order by its ID
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} - The order details
     */
    async getOrder(orderId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${orderId}`, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error.message);
            throw new Error(`Failed to get order: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Updates an order from another service
     * @param {number} orderId - The order ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - The updated order
     */
    async updateOrder(orderId, updateData) {
        try {
            const response = await axios.put(`${this.baseUrl}/service/${orderId}`, updateData, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating order ${orderId}:`, error.message);
            throw new Error(`Failed to update order: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Gets the status of an order
     * @param {number} orderId - The order ID
     * @returns {Promise<string>} - The order status
     */
    async getOrderStatus(orderId) {
        try {
            const order = await this.getOrder(orderId);
            return order.status;
        } catch (error) {
            console.error(`Error getting status for order ${orderId}:`, error.message);
            throw new Error(`Failed to get order status: ${error.message}`);
        }
    }

    /**
     * Gets all orders for a customer
     * @param {number} customerId - The customer ID
     * @returns {Promise<Array<Object>>} - List of orders
     */
    async getCustomerOrders(customerId) {
        try {
            const response = await axios.get(`${this.baseUrl}/customer/${customerId}`, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders for customer ${customerId}:`, error.message);
            throw new Error(`Failed to get customer orders: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Gets all orders for a restaurant
     * @param {number} restaurantId - The restaurant ID
     * @returns {Promise<Array<Object>>} - List of orders
     */
    async getRestaurantOrders(restaurantId) {
        try {
            const response = await axios.get(`${this.baseUrl}/restaurant/${restaurantId}`, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders for restaurant ${restaurantId}:`, error.message);
            throw new Error(`Failed to get restaurant orders: ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

// Export a singleton instance of the client
module.exports = new OrderClient();