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
    // TODO: For admin/restaurant roles you would add additional checks here
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

/**
 * Gets the latest order for the authenticated user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getLatestOrder = async (req, res, next) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        error: {
          message: "Authentication required to retrieve order",
          status: 401
        }
      });
    }

    const latestOrder = await orderService.getLatestOrderForCustomer(customerId);

    if (!latestOrder) {
      return res.status(404).json({
        error: {
          message: "No orders found for this user",
          status: 404
        }
      });
    }

    res.status(200).json(latestOrder);
  } catch (error) {
    next(error);
  }
};


/**
 * Updates an order (for customers).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateOrder = async (req, res, next) => {
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

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required to update an order',
          status: 401
        }
      });
    }

    const { status } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    // ADD: Other fields customers might be allowed to update

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: {
          message: 'No valid update fields provided',
          status: 400
        }
      });
    }

    const updatedOrder = await orderService.updateOrder(orderId, updateData, userId);

    if (!updatedOrder) {
      return res.status(404).json({
        error: {
          message: `Order with ID ${orderId} not found`,
          status: 404
        }
      });
    }

    // Publish the order update event if status was updated
    if (status) {
      await orderEventPublisher.publishOrderUpdated(updatedOrder);
    }

    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an order from internal services (privileged endpoint).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateOrderFromService = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const serviceToken = req.headers['x-service-token']; // You would implement service token validation

    // Check if this is an authorized service call
    // This is a simplified example - in a real app you would validate the service token
    const isAuthorizedService = serviceToken === process.env.INTERNAL_SERVICE_TOKEN;

    if (!isAuthorizedService) {
      return res.status(403).json({
        error: {
          message: 'Unauthorized service request',
          status: 403
        }
      });
    }

    if (!orderId) {
      return res.status(400).json({
        error: {
          message: 'Order ID is required',
          status: 400
        }
      });
    }

    const { deliveryFee, status, riderId, paymentId, deliveryId, orderPrepareTime } = req.body;
    const updateData = {};

    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
    if (status !== undefined) updateData.status = status;
    if (riderId !== undefined) updateData.riderId = riderId;
    if (paymentId !== undefined) updateData.paymentId = paymentId;
    if (deliveryId !== undefined) updateData.deliveryId = deliveryId;
    if (orderPrepareTime !== undefined) updateData.orderPrepareTime = orderPrepareTime;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: {
          message: 'No valid update fields provided',
          status: 400
        }
      });
    }

    const updatedOrder = await orderService.updateOrder(orderId, updateData, null, true);

    if (!updatedOrder) {
      return res.status(404).json({
        error: {
          message: `Order with ID ${orderId} not found`,
          status: 404
        }
      });
    }

    // Publish update event if status was changed
    if (status) {
      await orderEventPublisher.publishOrderUpdated(updatedOrder);
    }

    res.status(200).json({
      message: 'Order updated successfully by service',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};