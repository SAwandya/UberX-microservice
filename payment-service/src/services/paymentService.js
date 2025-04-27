// src/services/paymentService.js
const stripe = require("stripe")(
  require("../config/environment").STRIPE_SECRET_KEY
);
const paymentRepository = require("../repositories/paymentRepository");
// const paymentEventPublisher = require("../events/publishers/paymentEventPublisher");

class PaymentService {
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
        success_url: `${
          require("../config").clientUrl
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

  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      // Update payment status in database
      const payment =
        await paymentRepository.updatePaymentStatusByPaymentIntentId(
          paymentIntent.id,
          "COMPLETED",
          paymentIntent.latest_charge
        );

      // if (payment) {
      //   // Publish payment completed event
      //   await paymentEventPublisher.publishPaymentCompleted({
      //     orderId: parseInt(paymentIntent.metadata.orderId),
      //     paymentId: payment.id,
      //     stripePaymentIntentId: paymentIntent.id,
      //     amount: payment.amount,
      //     status: "COMPLETED",
      //   });
      // }
    } catch (error) {
      console.error("Error handling payment intent succeeded:", error);
      throw error;
    }
  }

  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Update payment status in database
      const payment =
        await paymentRepository.updatePaymentStatusByPaymentIntentId(
          paymentIntent.id,
          "FAILED"
        );

      // if (payment) {
      //   // Publish payment failed event
      //   await paymentEventPublisher.publishPaymentFailed({
      //     orderId: parseInt(paymentIntent.metadata.orderId),
      //     paymentId: payment.id,
      //     stripePaymentIntentId: paymentIntent.id,
      //     amount: payment.amount,
      //     status: "FAILED",
      //     error: paymentIntent.last_payment_error?.message || "Payment failed",
      //   });
      // }
    } catch (error) {
      console.error("Error handling payment intent failed:", error);
      throw error;
    }
  }

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

  async refundPayment(paymentIntentId, amount = null, reason = null) {
    try {
      // Get payment details
      const payment = await paymentRepository.getPaymentByPaymentIntentId(
        paymentIntentId
      );

      if (!payment) {
        throw new Error(
          `Payment with payment intent ID ${paymentIntentId} not found`
        );
      }

      if (payment.status !== "COMPLETED") {
        throw new Error(
          `Cannot refund payment that is not completed. Current status: ${payment.status}`
        );
      }

      const refundParams = {
        payment_intent: paymentIntentId,
      };

      // If amount is provided, add it to refund parameters
      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      // Create refund with Stripe
      const refund = await stripe.refunds.create(refundParams);

      // Store refund record in database
      const refundRecord = await paymentRepository.createRefund({
        paymentId: payment.id,
        stripeRefundId: refund.id,
        amount: amount || payment.amount,
        status: refund.status.toUpperCase(),
        reason,
      });

      // Update payment status
      await paymentRepository.updatePaymentStatus(payment.id, "REFUNDED");

      // // Publish payment refunded event
      // await paymentEventPublisher.publishPaymentRefunded({
      //   orderId: payment.orderId,
      //   paymentId: payment.id,
      //   refundId: refundRecord.id,
      //   stripePaymentIntentId: paymentIntentId,
      //   amount: refundRecord.amount,
      //   status: "REFUNDED",
      // });

      return refundRecord;
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId) {
    return paymentRepository.getPaymentByOrderId(orderId);
  }

  async getPaymentLogs(paymentId) {
    return paymentRepository.getPaymentLogs(paymentId);
  }

  async getRefundsByPaymentId(paymentId) {
    return paymentRepository.getRefundsByPaymentId(paymentId);
  }
}

module.exports = new PaymentService();
