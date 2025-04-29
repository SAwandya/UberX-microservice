/**
 * @interface EventSubscriberInterface
 * Defines a contract for event subscription
 */
class EventSubscriberInterface {
    /**
     * Subscribes to all relevant events
     * @returns {Promise<void>}
     */
    async subscribeToEvents() {
        throw new Error('Method not implemented');
    }

    /**
     * Handles an event
     * @param {Object} data - The event data
     * @returns {Promise<void>}
     */
    async handleEvent(data) {
        throw new Error('Method not implemented');
    }
}

module.exports = EventSubscriberInterface;