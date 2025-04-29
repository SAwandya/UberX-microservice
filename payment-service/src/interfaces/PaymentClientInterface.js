/**
 * @interface PaymentClientInterface
 * Defines the contract for other services to communicate with the payment service
 */
class PaymentClientInterface {
    /**
     * Creates a payment intent for an order
     * @param {Object} orderData - Order data including ID, customerId, totalAmount
     * @returns {Promise<Object>} - Payment intent details
     */
    async createPaymentIntent(orderData) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets payment status for an order
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} - Payment status details
     */
    async getPaymentStatus(orderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Processes a refund for an order
     * @param {number} orderId - The order ID
     * @param {number} [amount] - Refund amount (optional, defaults to full amount)
     * @param {string} [reason] - Reason for refund (optional)
     * @returns {Promise<Object>} - Refund details
     */
    async processRefund(orderId, amount, reason) {
        throw new Error('Method not implemented');
    }

    /**
     * Validates if a payment is complete
     * @param {number} orderId - The order ID
     * @returns {Promise<boolean>} - Payment validation result
     */
    async validatePayment(orderId) {
        throw new Error('Method not implemented');
    }
}

module.exports = PaymentClientInterface;