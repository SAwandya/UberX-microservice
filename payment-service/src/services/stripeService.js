const stripe = require("stripe")(
  require("../config/environment").STRIPE_SECRET_KEY
);
const paymentModel = require("../models/paymentModel");
const paymentEventPublisher = require("../events/publishers/paymentEventPublisher");

class StripeService {
  async createPaymentIntent(orderData) {
    try {
      // Check if payment already exists for this order
      const existingPayment = await paymentModel.getPaymentByOrderId(
        orderData.id
      );
      if (existingPayment) {
        return {
          paymentIntentId: existingPayment.stripePaymentIntentId,
          clientSecret: null, // We don't store client secrets
          status: existingPayment.status,
        };
      }

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(orderData.totalAmount * 100), // Convert to cents
        currency: "usd", // Use appropriate currency
        metadata: {
          orderId: orderData.id.toString(),
          customerId: orderData.customerId.toString(),
        },
      });

      // Store payment record in database
      await paymentModel.createPayment({
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

      // Create checkout session
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
      const payment = await paymentModel.updatePaymentStatus(
        paymentIntent.id,
        "COMPLETED"
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
    } catch (error) {
      console.error("Error handling payment intent succeeded:", error);
      throw error;
    }
  }

  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Update payment status in database
      const payment = await paymentModel.updatePaymentStatus(
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

  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundParams = {
        payment_intent: paymentIntentId,
      };

      // If amount is provided, add it to refund parameters
      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      // Update payment status in database
      const payment = await paymentModel.updatePaymentStatus(
        paymentIntentId,
        "REFUNDED"
      );

      if (payment) {
        // Publish payment refunded event
        await paymentEventPublisher.publishPaymentRefunded({
          orderId: payment.orderId,
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntentId,
          amount: refundParams.amount ? amount : payment.amount,
          status: "REFUNDED",
        });
      }

      return refund;
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  }
}

module.exports = new StripeService();
