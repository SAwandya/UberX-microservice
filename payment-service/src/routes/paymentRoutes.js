// src/routes/paymentRoutes.js
const express = require("express");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// Create a payment intent
router.post("/intent", paymentController.createPaymentIntent);

// Create a checkout session
router.post("/checkout", paymentController.createCheckoutSession);

// Handle Stripe webhook
router.post("/webhook", paymentController.handleWebhook);

// Refund a payment
router.post("/refund", paymentController.refundPayment);

// Get payment by order ID
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// Get payment logs
router.get("/:paymentId/logs", paymentController.getPaymentLogs);

// Get refunds for a payment
router.get("/:paymentId/refunds", paymentController.getRefunds);

module.exports = router;
