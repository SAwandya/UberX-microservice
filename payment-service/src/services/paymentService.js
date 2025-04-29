// src/services/paymentService.js
const stripe = require("stripe")(
  require("../config/environment").STRIPE_SECRET_KEY
);
const paymentRepository = require("../repositories/paymentRepository");
const paymentEventPublisher = require("../events/publishers/paymentEventPublisher");
const PaymentServiceInterface = require("../interfaces/PaymentServiceInterface");

/**
 * Implementation of the PaymentServiceInterface
 */
class PaymentService extends PaymentServiceInterface {
  /**
   * Creates a payment intent for an order
   * @param {Object} orderData - Order data including ID, customerId, totalAmount
   * @returns {Promise<Object>} - Payment intent details
   */
  async createPaymentIntent(orderData) {
    try {
      // Check if payment already exists for this order
      const existingPayment = await paymentRepository.getPaymentByOrderId(
        orderData.id
      );
      if (existingPayment) {
        return {
          paymentIntentId: existingPayment.stripePaymentIntentId,
          clientSecret: null, // We don't store client secrets
          status: existingPayment.status,
        };
      }

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(orderData.totalAmount * 100), // Convert to cents
        currency: "usd", // Use appropriate currency
        metadata: {
          orderId: orderData.id.toString(),
          customerId: orderData.customerId.toString(),
        },
      });

      // Store payment record in database
      await paymentRepository.createPayment({
        orderId: orderData.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: orderData.totalAmount,
        currency: "usd",
        status: paymentIntent.status,
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  /**
   * Creates a checkout session for an order
   * @param {Object} orderData - Order data including items, totalAmount, etc.
   * @returns {Promise<Object>} - Checkout session details
   */
  async createCheckoutSession(orderData) {
    try {
      // Format line items for Stripe
      const lineItems = orderData.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description || undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Create checkout session with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${require("../config").clientUrl
          }/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${require("../config").clientUrl}/order/cancel`,
        metadata: {
          orderId: orderData.id.toString(),
          customerId: orderData.customerId.toString(),
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Handles webhook events from payment provider
   * @param {Object} event - The webhook event object
   * @returns {Promise<void>}
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("Error handling webhook event:", error);
      throw error;
    }
  }

  /**
   * Processes a successful payment intent
   * @param {Object} paymentIntent - The payment intent object
   * @returns {Promise<Object>} - Updated payment details
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      // Update payment status in database
      const payment =
        await paymentRepository.updatePaymentStatusByPaymentIntentId(
          paymentIntent.id,
          "COMPLETED",
          paymentIntent.latest_charge
        );

      if (payment) {
        // Publish payment completed event
        await paymentEventPublisher.publishPaymentCompleted({
          orderId: parseInt(paymentIntent.metadata.orderId),
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: payment.amount,
          status: "COMPLETED",
        });
      }

      return payment;
    } catch (error) {
      console.error("Error handling payment intent succeeded:", error);
      throw error;
    }
  }

  /**
   * Processes a failed payment intent
   * @param {Object} paymentIntent - The payment intent object
   * @returns {Promise<Object>} - Updated payment details
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Update payment status in database
      const payment =
        await paymentRepository.updatePaymentStatusByPaymentIntentId(
          paymentIntent.id,
          "FAILED"
        );

      if (payment) {
        // Publish payment failed event
        await paymentEventPublisher.publishPaymentFailed({
          orderId: parseInt(paymentIntent.metadata.orderId),
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: payment.amount,
          status: "FAILED",
          error: paymentIntent.last_payment_error?.message || "Payment failed",
        });
      }

      return payment;
    } catch (error) {
      console.error("Error handling payment intent failed:", error);
      throw error;
    }
  }

  /**
   * Handles a completed checkout session
   * @param {Object} session - The checkout session object
   * @returns {Promise<void>}
   */
  async handleCheckoutSessionCompleted(session) {
    try {
      // For checkout sessions, we need to get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );

      // Then process it as a succeeded payment intent
      await this.handlePaymentIntentSucceeded(paymentIntent);
    } catch (error) {
      console.error("Error handling checkout session completed:", error);
      throw error;
    }
  }

  /**
   * Issues a refund for a payment
   * @param {string} paymentIntentId - The payment intent ID
   * @param {number} [amount] - Refund amount (optional, defaults to full amount)
   * @param {string} [reason] - Reason for refund (optional)
   * @returns {Promise<Object>} - Refund details
   */
  async refundPayment(paymentIntentId, amount = null, reason = null) {
    try {
      const refundParams = {
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer',
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      await paymentRepository.createRefund({
        paymentIntentId,
        refundId: refund.id,
        amount: amount || refund.amount / 100, // Convert from cents
        reason,
        status: refund.status,
      });

      return refund;
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  }

  /**
   * Retrieves a payment by order ID
   * @param {number} orderId - The order ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentByOrderId(orderId) {
    return paymentRepository.getPaymentByOrderId(orderId);
  }

  /**
   * Retrieves payment logs
   * @param {number} paymentId - The payment ID
   * @returns {Promise<Array>} - Payment logs
   */
  async getPaymentLogs(paymentId) {
    return paymentRepository.getPaymentLogs(paymentId);
  }

  /**
   * Retrieves refunds for a payment
   * @param {number} paymentId - The payment ID
   * @returns {Promise<Array>} - Refund details
   */
  async getRefundsByPaymentId(paymentId) {
    return paymentRepository.getRefundsByPaymentId(paymentId);
  }
}

module.exports = new PaymentService();
