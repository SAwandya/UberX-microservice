const axios = require('axios');
const PaymentClientInterface = require('../interfaces/PaymentClientInterface');

/**
 * Implementation of PaymentClientInterface for service-to-service communication
 */
class PaymentClient extends PaymentClientInterface {
    constructor() {
        super();
        this.baseUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service.uberx-payment.svc.cluster.local:4006/api/payments';
        this.serviceToken = process.env.INTERNAL_SERVICE_TOKEN || 'internal-service-token';
    }

    /**
     * Sets up common headers for service-to-service communication
     * @returns {Object} - Headers object
     * @private
     */
    _getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-service-token': this.serviceToken
        };
    }

    /**
     * Creates a payment intent for an order
     * @param {Object} orderData - Order data including ID, customerId, totalAmount
     * @returns {Promise<Object>} - Payment intent details
     */
    async createPaymentIntent(orderData) {
        try {
            const response = await axios.post(`${this.baseUrl}/intent`, orderData, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error creating payment intent for order ${orderData.id}:`, error.message);
            throw new Error(`Failed to create payment intent: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Gets payment status for an order
     * @param {number} orderId - The order ID
     * @returns {Promise<Object>} - Payment status details
     */
    async getPaymentStatus(orderId) {
        try {
            const response = await axios.get(`${this.baseUrl}/order/${orderId}/status`, {
                headers: this._getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error getting payment status for order ${orderId}:`, error.message);
            throw new Error(`Failed to get payment status: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Processes a refund for an order
     * @param {number} orderId - The order ID
     * @param {number} [amount] - Refund amount (optional, defaults to full amount)
     * @param {string} [reason] - Reason for refund (optional)
     * @returns {Promise<Object>} - Refund details
     */
    async processRefund(orderId, amount, reason) {
        try {
            const response = await axios.post(`${this.baseUrl}/order/${orderId}/refund`,
                { amount, reason },
                { headers: this._getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error(`Error processing refund for order ${orderId}:`, error.message);
            throw new Error(`Failed to process refund: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Validates if a payment is complete
     * @param {number} orderId - The order ID
     * @returns {Promise<boolean>} - Payment validation result
     */
    async validatePayment(orderId) {
        try {
            const response = await axios.get(`${this.baseUrl}/order/${orderId}/validate`, {
                headers: this._getHeaders()
            });
            return response.data.isValid;
        } catch (error) {
            console.error(`Error validating payment for order ${orderId}:`, error.message);
            throw new Error(`Failed to validate payment: ${error.response?.data?.error || error.message}`);
        }
    }
}

module.exports = new PaymentClient();