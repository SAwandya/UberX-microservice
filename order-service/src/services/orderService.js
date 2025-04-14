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