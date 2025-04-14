const pool = require('../config/database');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Creates an order and its associated items within a transaction.
 * @param {object} orderData - Data for the order { customerId, restaurantId, totalBill, deliveryFee, status }
 * @param {Array<object>} itemsData - Array of item data [{ foodItemId, quantity, price }]
 * @returns {Promise<Order>} - The created Order object.
 */
exports.createOrderWithItems = async (orderData, itemsData) => {
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const orderSql = `INSERT INTO orders (customerId, restaurantId, totalBill, deliveryFee, status) VALUES (?, ?, ?, ?, ?)`;
        const orderValues = [
            orderData.customerId,
            orderData.restaurantId,
            orderData.totalBill,
            orderData.deliveryFee,
            orderData.status || ORDER_STATUS.PENDING,
        ];
        const [orderResult] = await connection.execute(orderSql, orderValues);
        const newOrderId = orderResult.insertId;

        if (!newOrderId) {
            throw new Error('Failed to create order: No insertId returned.');
        }

        if (itemsData && itemsData.length > 0) {
            const itemSql = `INSERT INTO order_items (orderId, foodItemId, quantity, price) VALUES ?`;

            const itemValues = itemsData.map(item => [
                newOrderId,
                item.foodItemId,
                item.quantity,
                item.price,
            ]);

            await connection.query(itemSql, [itemValues]);
        } else {
            console.warn(`Order ${newOrderId} created with no items.`);
            // Rollback or throw here discuss and implement this. i think rollback is better
            // await connection.rollback();
            // throw new Error('Cannot create an order with no items.');
        }


        await connection.commit();

        return new Order(
            newOrderId,
            orderData.customerId,
            orderData.restaurantId,
            orderData.totalBill,
            orderData.deliveryFee,
            orderData.status || ORDER_STATUS.PENDING
            // Add other fields if needed/available
        );

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating order in repository:', error);
        throw new Error(`Database error during order creation: ${error.message}`);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// --- Add other repository functions as needed (e.g., findById, updateStatus) ---

/**
 * Finds an order by its ID.
 * @param {number} orderId
 * @returns {Promise<Order | null>}
 */
exports.findOrderById = async (orderId) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
        if (rows.length === 0) return null;
        const order = rows[0];
        return new Order(
            order.id, order.customerId, order.restaurantId, order.totalBill,
            order.deliveryFee, order.status, order.orderPrepareTime, order.riderId,
            order.paymentId, order.deliveryId, order.created_at, order.updated_at
        );
    } catch (error) {
        console.error('Error finding order by ID:', error);
        throw new Error(`Database error finding order: ${error.message}`);
    }
};

/**
 * Finds order items by order ID.
 * @param {number} orderId
 * @returns {Promise<Array<OrderItem>>}
 */
exports.findItemsByOrderId = async (orderId) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM order_items WHERE orderId = ?", [orderId]);
        return rows.map(item => new OrderItem(item.id, item.orderId, item.foodItemId, item.quantity, item.price));
    } catch (error) {
        console.error('Error finding order items by order ID:', error);
        throw new Error(`Database error finding order items: ${error.message}`);
    }
};

/**
 * Finds the latest order for a customer.
 * @param {number} customerId - The ID of the customer
 * @returns {Promise<Order | null>} - The latest order or null if no orders found
 */
exports.findLatestOrderByCustomerId = async (customerId) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM orders WHERE customerId = ? ORDER BY created_at DESC LIMIT 1",
            [customerId]
        );

        if (rows.length === 0) return null;

        const order = rows[0];
        return new Order(
            order.id, order.customerId, order.restaurantId, order.totalBill,
            order.deliveryFee, order.status, order.orderPrepareTime, order.riderId,
            order.paymentId, order.deliveryId, order.created_at, order.updated_at
        );
    } catch (error) {
        console.error('Error finding latest order for customer:', error);
        throw new Error(`Database error finding latest order: ${error.message}`);
    }
};

/**
 * Updates an order with the given data.
 * @param {number} orderId - The ID of the order to update
 * @param {object} updateData - The data to update the order with
 * @returns {Promise<Order | null>} - The updated order or null if not found
 */
exports.updateOrder = async (orderId, updateData) => {
    try {
        const updateFields = [];
        const values = [];

        if (updateData.status !== undefined) {
            updateFields.push('status = ?');
            values.push(updateData.status);
        }
        if (updateData.deliveryFee !== undefined) {
            updateFields.push('deliveryFee = ?');
            values.push(updateData.deliveryFee);
        }
        if (updateData.riderId !== undefined) {
            updateFields.push('riderId = ?');
            values.push(updateData.riderId);
        }
        if (updateData.paymentId !== undefined) {
            updateFields.push('paymentId = ?');
            values.push(updateData.paymentId);
        }
        if (updateData.deliveryId !== undefined) {
            updateFields.push('deliveryId = ?');
            values.push(updateData.deliveryId);
        }
        if (updateData.orderPrepareTime !== undefined) {
            updateFields.push('orderPrepareTime = ?');
            values.push(updateData.orderPrepareTime);
        }

        if (updateFields.length === 0) {
            return await exports.findOrderById(orderId);
        }

        values.push(orderId);

        await pool.execute(
            `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        return await exports.findOrderById(orderId);
    } catch (error) {
        console.error('Error updating order:', error);
        throw new Error(`Database error updating order: ${error.message}`);
    }
};