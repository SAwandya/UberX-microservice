// order-service/controllers/orderController.js
const orderService = require('../services/orderService');
const orderEventPublisher = require('../events/publishers/orderEventPublisher');

/**
 * Creates a new order.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createOrder = async (req, res, next) => {
  try {
    // Get customer ID from the authenticated user
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        error: {
          message: "Authentication required to create an order",
          status: 401,
        },
      });
    }

    // Validate request body
    const { restaurantId, items, deliveryFee } = req.body;

    if (
      !restaurantId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: {
          message:
            "Invalid order data. Required: restaurantId and items array",
          status: 400,
        },
      });
    }

    // Create the order via service
    const newOrder = await orderService.createOrder(customerId, {
      restaurantId,
      items,
      deliveryFee,
    });

    // Publish the order created event
    await orderEventPublisher.publishOrderCreated(newOrder);

    // Return success response
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
};

/**
 * Gets an order by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(400).json({
        error: {
          message: 'Order ID is required',
          status: 400
        }
      });
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        error: {
          message: `Order with ID ${orderId} not found`,
          status: 404
        }
      });
    }

    // Security check: Only allow users to view their own orders
    // For admin/restaurant roles you would add additional checks here
    if (order.customerId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to view this order',
          status: 403
        }
      });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
};