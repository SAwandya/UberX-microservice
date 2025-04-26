// src/models/paymentModel.js
class Payment {
  constructor(data) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.stripePaymentIntentId = data.stripePaymentIntentId;
    this.amount = data.amount;
    this.currency = data.currency || "USD";
    this.status = data.status;
    this.paymentMethod = data.paymentMethod || "CARD";
    this.transactionId = data.transactionId;
    this.metadata = data.metadata;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

class PaymentLog {
  constructor(data) {
    this.id = data.id;
    this.paymentId = data.paymentId;
    this.event = data.event;
    this.data = data.data;
    this.created_at = data.created_at;
  }
}

class Refund {
  constructor(data) {
    this.id = data.id;
    this.paymentId = data.paymentId;
    this.stripeRefundId = data.stripeRefundId;
    this.amount = data.amount;
    this.status = data.status;
    this.reason = data.reason;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

module.exports = {
  Payment,
  PaymentLog,
  Refund,
};
