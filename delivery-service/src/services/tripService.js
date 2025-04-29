const tripRepository = require('../repositories/tripRepository');
const riderRepository = require('../repositories/riderRepository');
const axios = require('axios');
const { ORDER_SERVICE_URL } = require('../config/environment');
const TripServiceInterface = require('../interfaces/TripServiceInterface');

/**
 * Implementation of the TripServiceInterface
 */
class TripService extends TripServiceInterface {
    /**
     * Creates a new trip from an order
     * @param {Object} orderData - Order data with delivery details
     * @returns {Promise<Object>} - The created trip
     */
    async createTripFromOrder(orderData) {
        try {
            const { orderId, customerId, startLocation, endLocation } = orderData;

            // Fetch an available rider
            const rider = await riderRepository.findAvailableRider();

            const tripData = {
                orderId,
                riderId: rider.id,
                customerId,
                status: 'pending',
                startLocation,
                endLocation,
            };

            const newTrip = await tripRepository.createTrip(tripData);

            // Update the order with the deliveryId (trip.id)
            await this.updateOrderWithTripInfo(orderId, newTrip.id);

            return newTrip;
        } catch (error) {
            console.error('Error creating trip from order:', error);
            throw new Error(`Failed to create trip: ${error.message}`);
        }
    }

    /**
     * Updates order service with trip information
     * @param {number} orderId - The order ID
     * @param {number} tripId - The trip ID
     * @returns {Promise<void>}
     * @private
     */
    async updateOrderWithTripInfo(orderId, tripId) {
        try {
            await axios.put(
                `${ORDER_SERVICE_URL}/api/orders/service/${orderId}`,
                { deliveryId: tripId },
                { headers: { 'x-service-token': process.env.INTERNAL_SERVICE_TOKEN || '1234' } }
            );
        } catch (error) {
            console.error(`Error updating order ${orderId} with trip info:`, error);
            // Don't throw error here to avoid transaction failure
            // Consider implementing a retry mechanism or event-based solution
        }
    }

    /**
     * Gets a trip by ID
     * @param {number} tripId - The trip ID
     * @returns {Promise<Object>} - Trip details
     */
    async getTripById(tripId) {
        try {
            const trip = await tripRepository.findTripById(tripId);
            if (!trip) {
                throw new Error('Trip not found');
            }
            return trip;
        } catch (error) {
            console.error(`Error getting trip ${tripId}:`, error);
            throw error;
        }
    }

    /**
     * Updates a trip
     * @param {number} tripId - The trip ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - The updated trip
     */
    async updateTrip(tripId, updateData) {
        try {
            const trip = await tripRepository.findTripById(tripId);
            if (!trip) {
                throw new Error('Trip not found');
            }

            const updatedTrip = await tripRepository.updateTrip(tripId, updateData);
            return updatedTrip;
        } catch (error) {
            console.error(`Error updating trip ${tripId}:`, error);
            throw error;
        }
    }

    /**
     * Gets all trips for a customer
     * @param {number} customerId - The customer ID
     * @returns {Promise<Array<Object>>} - List of trips
     */
    async getTripsForCustomer(customerId) {
        try {
            return await tripRepository.findTripsByCustomerId(customerId);
        } catch (error) {
            console.error(`Error getting trips for customer ${customerId}:`, error);
            throw error;
        }
    }

    /**
     * Gets all trips for a rider
     * @param {number} riderId - The rider ID
     * @returns {Promise<Array<Object>>} - List of trips
     */
    async getTripsForRider(riderId) {
        try {
            return await tripRepository.findTripsByRiderId(riderId);
        } catch (error) {
            console.error(`Error getting trips for rider ${riderId}:`, error);
            throw error;
        }
    }

    /**
     * Gets active trips for a rider
     * @param {number} riderId - The rider ID
     * @returns {Promise<Array<Object>>} - List of active trips
     */
    async getActiveTripsForRider(riderId) {
        try {
            return await tripRepository.findActiveTripsForRider(riderId);
        } catch (error) {
            console.error(`Error getting active trips for rider ${riderId}:`, error);
            throw error;
        }
    }
}

module.exports = new TripService();



