// src/controllers/paymentController.js
const paymentService = require("../services/paymentService");
const stripe = require("stripe")(require("../config/environment").STRIPE_SECRET_KEY);
const env = require("../config/environment");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId, customerId, totalAmount, items } = req.body;

    if (!orderId || !customerId || !totalAmount) {
      return res.status(400).json({
        error:
          "Missing required fields: orderId, customerId, and totalAmount are required",
      });
    }

    const result = await paymentService.createPaymentIntent({
      id: orderId,
      customerId,
      totalAmount,
      items,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId, customerId, items, totalAmount } = req.body;

    if (!orderId || !customerId || !items || !totalAmount) {
      return res.status(400).json({
        error:
          "Missing required fields: orderId, customerId, items, and totalAmount are required",
      });
    }

    const result = await paymentService.createCheckoutSession({
      id: orderId,
      customerId,
      totalAmount,
      items,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    await paymentService.handleWebhookEvent(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    const refund = await paymentService.refundPayment(
      paymentIntentId,
      amount,
      reason
    );

    res.status(200).json(refund);
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const payment = await paymentService.getPaymentByOrderId(orderId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentLogs = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const logs = await paymentService.getPaymentLogs(paymentId);

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error getting payment logs:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const refunds = await paymentService.getRefundsByPaymentId(paymentId);

    res.status(200).json(refunds);
  } catch (error) {
    console.error("Error getting refunds:", error);
    res.status(500).json({ error: error.message });
  }
};
