// src/events/publishers/paymentEventPublisher.js
const natsConnectionManager = require("../../utils/natsConnectionManager");

class PaymentEventPublisher {
  async publishPaymentCompleted(paymentData) {
    await natsConnectionManager.publishMessage("payment.completed", {
      eventType: "PaymentCompleted",
      payment: paymentData,
      timestamp: new Date().toISOString(),
    });
  }

  async publishPaymentFailed(paymentData) {
    await natsConnectionManager.publishMessage("payment.failed", {
      eventType: "PaymentFailed",
      payment: paymentData,
      timestamp: new Date().toISOString(),
    });
  }

  async publishPaymentRefunded(paymentData) {
    await natsConnectionManager.publishMessage("payment.refunded", {
      eventType: "PaymentRefunded",
      payment: paymentData,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new PaymentEventPublisher();
