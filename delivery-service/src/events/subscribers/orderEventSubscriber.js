const natsConnectionManager = require("../../utils/natsConnectionManager");

class OrderEventSubscriber {
  constructor() {
    this.SUBJECT_ORDER_CREATED = "orders.created";
    this.SUBJECT_ORDER_UPDATED = "orders.updated";
    this.SUBJECT_ORDER_CANCELLED = "orders.cancelled";
  }

  async subscribeToEvents() {
    // Subscribe to order created events
    await natsConnectionManager.subscribe(
      this.SUBJECT_ORDER_CREATED,
      async (data) => {
        console.log("Received order created event:", data);

        // Process the new order for delivery
        await this.processNewOrder(data.order);
      }
    );

    // Subscribe to order updated events
    await natsConnectionManager.subscribe(
      this.SUBJECT_ORDER_UPDATED,
      async (data) => {
        console.log("Received order updated event:", data);

        // Update delivery status based on order updates
        await this.updateDeliveryForOrder(data.order);
      }
    );

    // Subscribe to order cancelled events
    await natsConnectionManager.subscribe(
      this.SUBJECT_ORDER_CANCELLED,
      async (data) => {
        console.log("Received order cancelled event:", data);

        // Cancel delivery for the order
        await this.cancelDeliveryForOrder(data.orderId);
      }
    );
  }

  async processNewOrder(order) {
    try {
      // Create a new delivery for the order
      // await deliveryService.createDelivery({
      //   orderId: order.id,
      //   customerId: order.customerId,
      //   shippingAddress: order.shippingAddress,
      //   status: "PENDING",
      //   estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(),
      // });



      console.log(`Created delivery for order ${order.id}`);
    } catch (error) {
      console.error(`Error processing new order ${order.id}:`, error);
    }
  }

  async updateDeliveryForOrder(order) {
    try {
      // Update delivery based on order status
      if (order.status === "PAID") {
        // await deliveryService.updateDeliveryStatus(order.id, "PREPARING");
      } else if (order.status === "SHIPPED") {
        // await deliveryService.updateDeliveryStatus(order.id, "IN_TRANSIT");
      } else if (order.status === "DELIVERED") {
        // await deliveryService.updateDeliveryStatus(order.id, "DELIVERED");
      }

      console.log(`Updated delivery for order ${order.id}`);
    } catch (error) {
      console.error(`Error updating delivery for order ${order.id}:`, error);
    }
  }

  async cancelDeliveryForOrder(orderId) {
    try {
      // Cancel the delivery
      // await deliveryService.cancelDelivery(orderId);
      console.log(`Cancelled delivery for order ${orderId}`);
    } catch (error) {
      console.error(`Error cancelling delivery for order ${orderId}:`, error);
    }
  }

  calculateEstimatedDeliveryTime() {
    // Simple logic to calculate delivery time (24-48 hours from now)
    const now = new Date();
    const deliveryTime = new Date(now);
    deliveryTime.setHours(now.getHours() + 24 + Math.floor(Math.random() * 24));
    return deliveryTime;
  }
}

module.exports = new OrderEventSubscriber();