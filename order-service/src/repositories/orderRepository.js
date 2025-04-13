const db = require('../config/database');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const logger = require('../utils/logger');

class OrderRepository {
    async createOrder(orderData) {
        try {
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                // Insert order
                const [orderResult] = await connection.execute(
                    `INSERT INTO orders 
           (user_id, status, total_amount, delivery_address, payment_method, payment_status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        orderData.userId,
                        orderData.status || 'created',
                        orderData.totalAmount,
                        orderData.deliveryAddress,
                        orderData.paymentMethod,
                        orderData.paymentStatus || 'pending',
                    ]
                );

                const orderId = orderResult.insertId;

                // Insert order items
                if (orderData.items && orderData.items.length > 0) {
                    const itemValues = orderData.items.map((item) => [
                        orderId,
                        item.itemId,
                        item.itemName,
                        item.quantity,
                        item.unitPrice,
                        item.quantity * item.unitPrice,
                        item.notes || null,
                    ]);

                    for (const itemValue of itemValues) {
                        await connection.execute(
                            `INSERT INTO order_items 
               (order_id, item_id, item_name, quantity, unit_price, subtotal, notes) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            itemValue
                        );
                    }
                }

                await connection.commit();
                return await this.findById(orderId);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            logger.error(`Database error in createOrder: ${error.message}`);
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            // Get order
            const [orderRows] = await db.execute(
                'SELECT * FROM orders WHERE id = ?',
                [id]
            );

            if (orderRows.length === 0) return null;

            // Get order items
            const [itemRows] = await db.execute(
                'SELECT * FROM order_items WHERE order_id = ?',
                [id]
            );

            const order = Order.fromDatabase(
                orderRows[0],
                itemRows.map(item => OrderItem.fromDatabase(item))
            );

            return order;
        } catch (error) {
            logger.error(`Database error in findById: ${error.message}`);
            throw new Error(`Failed to find order: ${error.message}`);
        }
    }

    async findByUserId(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            // Get orders
            const [orderRows] = await db.execute(
                'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [userId, limit, offset]
            );

            // Get count for pagination
            const [countResult] = await db.execute(
                'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
                [userId]
            );

            const totalOrders = countResult[0].total;

            // Get all order items for these orders in a single query
            const orderIds = orderRows.map(order => order.id);

            if (orderIds.length === 0) {
                return {
                    orders: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        pages: 0
                    }
                };
            }

            const [itemRows] = await db.execute(
                `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
                orderIds
            );

            // Group items by order_id
            const itemsByOrderId = itemRows.reduce((acc, item) => {
                if (!acc[item.order_id]) {
                    acc[item.order_id] = [];
                }
                acc[item.order_id].push(OrderItem.fromDatabase(item));
                return acc;
            }, {});

            // Create Order objects with their items
            const orders = orderRows.map(orderRow => {
                return Order.fromDatabase(
                    orderRow,
                    itemsByOrderId[orderRow.id] || []
                );
            });

            return {
                orders,
                pagination: {
                    total: totalOrders,
                    page,
                    limit,
                    pages: Math.ceil(totalOrders / limit)
                }
            };
        } catch (error) {
            logger.error(`Database error in findByUserId: ${error.message}`);
            throw new Error(`Failed to find orders: ${error.message}`);
        }
    }

    async updateOrder(id, updateData) {
        try {
            // Build the SET part of the query dynamically based on updateData
            const allowedFields = [
                'status',
                'total_amount',
                'delivery_address',
                'payment_method',
                'payment_status'
            ];

            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(snakeKey)) {
                    updates.push(`${snakeKey} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) {
                return await this.findById(id); // Nothing to update
            }

            values.push(id); // Add id for the WHERE clause

            const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;

            await db.execute(query, values);

            return await this.findById(id);
        } catch (error) {
            logger.error(`Database error in updateOrder: ${error.message}`);
            throw new Error(`Failed to update order: ${error.message}`);
        }
    }

    async deleteOrder(id) {
        try {
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                // Delete order items first (foreign key constraint)
                await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);

                // Delete the order
                const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [id]);

                await connection.commit();
                return result.affectedRows > 0;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            logger.error(`Database error in deleteOrder: ${error.message}`);
            throw new Error(`Failed to delete order: ${error.message}`);
        }
    }
}

module.exports = new OrderRepository();