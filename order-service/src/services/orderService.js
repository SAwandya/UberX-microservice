const orderRepository = require('../repositories/orderRepository');
const { ORDER_STATUS } = require('../utils/constants');
const Order = require('../models/order');
const OrderServiceInterface = require('../interfaces/OrderServiceInterface');

/**
 * Implementation of the OrderServiceInterface
 */
class OrderService extends OrderServiceInterface {
    /**
     * Creates a new order.
     * @param {number} customerId - The ID of the customer placing the order.
     * @param {object} orderDetails - Details of the order.
     * @param {number} orderDetails.restaurantId - ID of the restaurant.
     * @param {Array<object>} orderDetails.items - Array of items [{ foodItemId, quantity, price }].
     * @param {number} [orderDetails.deliveryFee=0] - The delivery fee (optional, defaults to 0).
     * @returns {Promise<Order>} - The newly created order object.
     */
    async createOrder(customerId, orderDetails) {
        const { restaurantId, items, deliveryFee = 0 } = orderDetails;

        if (!customerId || !restaurantId || !items || items.length === 0) {
            // use specific error types later
            throw new Error('Missing required order data: customerId, restaurantId, and items are required.');
        }

        // Calculate total bill (sum of all item prices * quantities)
        const totalBill = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create a new order with initial status
        const newOrder = await orderRepository.createOrder({
            customerId,
            restaurantId,
            totalBill,
            deliveryFee,
            status: ORDER_STATUS.PENDING,
            items
        });

        return newOrder;
    }

    /**
     * Gets the latest order for a customer
     * @param {number} customerId - The ID of the customer
     * @returns {Promise<Object>} - The latest order
     */
    async getLatestOrderForCustomer(customerId) {
        return await orderRepository.findLatestOrderByCustomer(customerId);
    }

    /**
     * Gets an order by its ID
     * @param {number} orderId - The ID of the order
     * @returns {Promise<Object>} - The order
     */
    async getOrderById(orderId) {
        return await orderRepository.findOrderById(orderId);
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
        try {
            const currentOrder = await orderRepository.findOrderById(orderId);
            if (!currentOrder) {
                return null;
            }

            if (!isServiceUpdate && currentOrder.customerId !== requesterId) {
                // TODO: might check if requester is admin/restaurant/delivery staff
                throw new Error('You do not have permission to update this order');
            }

            if (updateData.status && !isValidStatusTransition(currentOrder.status, updateData.status, isServiceUpdate)) {
                throw new Error(`Invalid status transition from ${currentOrder.status} to ${updateData.status}`);
            }

            const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

            if (updatedOrder && updateData.status) {
                console.log(`Order ${orderId} status changed from ${currentOrder.status} to ${updatedOrder.status}`);
            }

            return updatedOrder;
        } catch (error) {
            console.error(`Error in orderService.updateOrder for order ${orderId}:`, error);
            throw error;
        }
    }
}

/**
 * Validates if a status transition is allowed.
 * 
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New order status
 * @param {boolean} isServiceUpdate - Whether update is being made by internal service
 * @returns {boolean} - Whether transition is valid
 */
function isValidStatusTransition(currentStatus, newStatus, isServiceUpdate) {
    // Service updates can make any transition
    if (isServiceUpdate) return true;

    // Define allowed transitions for customer-initiated updates
    const allowedTransitions = {
        [ORDER_STATUS.PENDING]: [ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.CANCELLED],
        // Add more transitions as needed
    };

    const allowed = allowedTransitions[currentStatus];
    return allowed && allowed.includes(newStatus);
}

// Export a singleton instance of the service
module.exports = new OrderService();