const orderRepository = require('../repositories/orderRepository');
const { ORDER_STATUS } = require('../utils/constants');
const Order = require('../models/order');

/**
 * Creates a new order.
 * @param {number} customerId - The ID of the customer placing the order.
 * @param {object} orderDetails - Details of the order.
 * @param {number} orderDetails.restaurantId - ID of the restaurant.
 * @param {Array<object>} orderDetails.items - Array of items [{ foodItemId, quantity, price }].
 * @param {number} [orderDetails.deliveryFee=0] - The delivery fee (optional, defaults to 0).
 * @returns {Promise<Order>} - The newly created order object.
 */
exports.createOrder = async (customerId, orderDetails) => {
    const { restaurantId, items, deliveryFee = 0 } = orderDetails;

    if (!customerId || !restaurantId || !items || items.length === 0) {
        // use specific error types later
        throw new Error('Missing required order data: customerId, restaurantId, and items are required.');
    }

    // later fetch prices from a product/restaurant service here
    // to prevent users from manipulating prices.
    let calculatedTotalBill = 0;
    for (const item of items) {
        if (typeof item.price !== 'number' || item.price < 0 || typeof item.quantity !== 'number' || item.quantity <= 0) {
            throw new Error(`Invalid price or quantity for foodItemId ${item.foodItemId}`);
        }
        calculatedTotalBill += item.price * item.quantity;
    }

    const orderData = {
        customerId: customerId,
        restaurantId: restaurantId,
        totalBill: calculatedTotalBill,
        deliveryFee: deliveryFee,
        status: ORDER_STATUS.PENDING,
    };

    const itemsData = items.map(item => ({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: item.price,
    }));


    try {
        const newOrder = await orderRepository.createOrderWithItems(orderData, itemsData);
        console.log(`Order ${newOrder.id} created successfully for customer ${customerId}.`);

        // e.g., Trigger payment processing, notify restaurant, assign delivery rider
        // await paymentService.initiatePayment(newOrder.id, newOrder.totalBill + newOrder.deliveryFee);
        // await notificationService.notifyRestaurant(restaurantId, newOrder.id);

        return newOrder;
    } catch (error) {
        console.error(`Error in orderService.createOrder for customer ${customerId}:`, error);
        throw error;
    }
};

exports.getOrderById = async (orderId) => {
    try {
        const order = await orderRepository.findOrderById(orderId);
        if (!order) {
            return null;
        }
        const items = await orderRepository.findItemsByOrderId(orderId);
        return { ...order, items: items };
    } catch (error) {
        console.error(`Error in orderService.getOrderById for order ${orderId}:`, error);
        throw error;
    }
}

/**
 * Gets the latest order for a customer.
 * @param {number} customerId - The ID of the customer
 * @returns {Promise<Object | null>} - The latest order with its items or null if no orders found
 */
exports.getLatestOrderForCustomer = async (customerId) => {
    try {
        const order = await orderRepository.findLatestOrderByCustomerId(customerId);
        if (!order) {
            return null;
        }

        const items = await orderRepository.findItemsByOrderId(order.id);
        return { ...order, items };
    } catch (error) {
        console.error(`Error in orderService.getLatestOrderForCustomer for customer ${customerId}:`, error);
        throw error;
    }
};


/**
 * Updates an existing order.
 * @param {number} orderId - The ID of the order to update
 * @param {object} updateData - The data to update in the order
 * @param {number} [requesterId] - The ID of the user making the request (for authorization)
 * @param {boolean} [isServiceUpdate=false] - Whether this is an internal service update
 * @returns {Promise<Order|null>} - The updated order object or null if not found
 */
exports.updateOrder = async (orderId, updateData, requesterId, isServiceUpdate = false) => {
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
};

/**
 * Validates if a status transition is allowed.
 * @param {string} currentStatus - The current status of the order
 * @param {string} newStatus - The new status to transition to
 * @param {boolean} isServiceUpdate - Whether this is a service-level update
 * @returns {boolean} - Whether the transition is valid
 */
const isValidStatusTransition = (currentStatus, newStatus, isServiceUpdate) => {
    if (isServiceUpdate) return true;

    const allowedTransitions = {
        [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.READY_FOR_PICKUP]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED],
        // Terminal states
        [ORDER_STATUS.DELIVERED]: [],
        [ORDER_STATUS.CANCELLED]: [],
        [ORDER_STATUS.FAILED]: []
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};