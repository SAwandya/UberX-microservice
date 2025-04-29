/**
 * @interface EventPublisherInterface
 * Defines a contract for event publishing
 */
class EventPublisherInterface {
    /**
     * Publishes a message to the specified subject
     * @param {string} subject - The subject to publish to
     * @param {Object} data - The data to publish
     * @returns {Promise<void>}
     */
    async publishMessage(subject, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Publishes an order created event
     * @param {Object} order - The created order
     * @returns {Promise<void>}
     */
    async publishOrderCreated(order) {
        throw new Error('Method not implemented');
    }

    /**
     * Publishes an order updated event
     * @param {Object} order - The updated order
     * @returns {Promise<void>}
     */
    async publishOrderUpdated(order) {
        throw new Error('Method not implemented');
    }

    /**
     * Publishes an order cancelled event
     * @param {number} orderId - The ID of the cancelled order
     * @returns {Promise<void>}
     */
    async publishOrderCancelled(orderId) {
        throw new Error('Method not implemented');
    }
}

module.exports = EventPublisherInterface;