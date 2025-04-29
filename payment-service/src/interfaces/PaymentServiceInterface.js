/**
 * @interface PaymentServiceInterface
 * Defines the contract for payment service operations
 */
class PaymentServiceInterface {
    /**
     * Creates a payment intent for an order
     * @param {Object} orderData - Order data including ID, customerId, totalAmount
     * @returns {Promise<Object>} - Payment intent details
     */
    async createPaymentIntent(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Creates a checkout session for an order
     * @param {Object} orderData - Order data including items, totalAmount, etc.
     * @returns {Promise<Object>} - Checkout session details
     */
    async createCheckoutSession(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Handles webhook events from payment provider
     * @param {Object} event - The webhook event object
     * @returns {Promise<void>}
     */
    async handleWebhookEvent(event) {
        throw new Error('Method not implemented');
    }

    /**
     * Processes a successful payment intent
     * @param {Object} paymentIntent - The payment intent object
     * @returns {Promise<Object>} - Updated payment details
     */
    async handlePaymentIntentSucceeded(paymentIntent) {
        throw new Error('Method not implemented');
    }

    /**
     * Processes a failed payment intent
     * @param {Object} paymentIntent - The payment intent object
     * @returns {Promise<Object>} - Updated payment details
     */
    async handlePaymentIntentFailed(paymentIntent) {
        throw new Error('Method not implemented');
    }

    /**
     * Retrieves a payment by order ID
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} - Payment details
     */
    async getPaymentByOrderId(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Issues a refund for a payment
     * @param {string} paymentIntentId - The payment intent ID
     * @param {number} [amount] - Refund amount (optional, defaults to full amount)
     * @param {string} [reason] - Reason for refund (optional)
     * @returns {Promise<Object>} - Refund details
     */
    async refundPayment(paymentIntentId, amount, reason) {
        throw new Error('Method not implemented');
    }
}

module.exports = PaymentServiceInterface;