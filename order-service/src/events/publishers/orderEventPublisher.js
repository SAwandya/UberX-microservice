const natsConnectionManager = require("../../utils/natsConnectionManager");

class OrderEventPublisher {
  constructor() {
    this.SUBJECT_ORDER_CREATED = "orders.created";
    this.SUBJECT_ORDER_UPDATED = "orders.updated";
    this.SUBJECT_ORDER_CANCELLED = "orders.cancelled";
  }

  async publishOrderCreated(order) {
    const eventData = {
      eventType: "OrderCreated",
      order,
      timestamp: new Date().toISOString(),
    };

    await natsConnectionManager.publishMessage(
      this.SUBJECT_ORDER_CREATED,
      eventData
    );
  }

  async publishOrderUpdated(order) {
    const eventData = {
      eventType: "OrderUpdated",
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
      timestamp: new Date().toISOString(),
    };

    await natsConnectionManager.publishMessage(
      this.SUBJECT_ORDER_UPDATED,
      eventData
    );
  }

  async publishOrderCancelled(orderId) {
    const eventData = {
      eventType: "OrderCancelled",
      orderId: orderId,
      timestamp: new Date().toISOString(),
    };

    await natsConnectionManager.publishMessage(
      this.SUBJECT_ORDER_CANCELLED,
      eventData
    );
  }
}

module.exports = new OrderEventPublisher();
