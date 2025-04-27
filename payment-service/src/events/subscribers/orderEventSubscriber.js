// src/events/subscribers/orderEventSubscriber.js
const paymentService = require("../../services/paymentService");
const natsConnectionManager = require("../../utils/natsConnectionManager");
const paymentEventPublisher = require("../publishers/paymentEventPublisher");

class OrderEventSubscriber {
  async subscribeToEvents() {
    await natsConnectionManager.subscribe(
      "orders.created",
      this.handleOrderCreated.bind(this)
    );
    await natsConnectionManager.subscribe(
      "orders.cancelled",
      this.handleOrderCancelled.bind(this)
    );
  }

  async handleOrderCreated(data) {
    try {
      console.log("Received order created event:", data);

      const { order } = data;

      // Create a payment intent for the order
      await paymentService.createPaymentIntent({
        id: order.id,
        customerId: order.customerId,
        totalAmount: order.totalAmount || order.totalBill,
        items: order.items || [],
      });

      console.log(`Created payment intent for order ${order.id}`);
    } catch (error) {
      console.error(`Error processing order ${data.order.id}:`, error);

      // Publish payment failed event
      await paymentEventPublisher.publishPaymentFailed({
        orderId: data.order.id,
        status: "FAILED",
        error: error.message,
      });
    }
  }

  async handleOrderCancelled(data) {
    try {
      console.log("Received order cancelled event:", data);

      const { order } = data;

      // Get payment for this order
      const payment = await paymentService.getPaymentByOrderId(order.id);

      if (payment && payment.status === "COMPLETED") {
        // Refund the payment
        await paymentService.refundPayment(
          payment.stripePaymentIntentId,
          null,
          "Order cancelled"
        );
        console.log(`Refunded payment for cancelled order ${order.id}`);
      }
    } catch (error) {
      console.error(
        `Error processing cancelled order ${data.order.id}:`,
        error
      );
    }
  }
}

module.exports = new OrderEventSubscriber();
