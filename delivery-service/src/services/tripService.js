const tripRepository = require('../repositories/tripRepository');
const riderRepository = require('../repositories/riderRepository');
const axios = require('axios');
const { ORDER_SERVICE_URL } = require('../config/environment');

exports.createTripFromOrder = async (orderData) => {
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
        // await axios.patch(
        //     `${ORDER_SERVICE_URL}/api/orders/from-service/${orderId}`,
        //     { deliveryId: newTrip.id },
        //     { headers: { 'x-service-token': process.env.INTERNAL_SERVICE_TOKEN || '1234' } }
        // );

        return newTrip;
    } catch (error) {
        throw new Error(`Failed to create trip: ${error.message}`);
    }
};

exports.updateTrip = async (tripId, updateData) => {
    try {
        const updatedTrip = await tripRepository.updateTrip(tripId, updateData);

        if (updateData.status === 'completed' || updateData.status === 'canceled') {
            await riderRepository.updateRiderAvailability(updatedTrip.riderId, true);
        }

        return updatedTrip;
    } catch (error) {
        throw new Error(`Failed to update trip: ${error.message}`);
    }
};

exports.getTripById = async (tripId) => {
    try {
        const trip = await tripRepository.findTripById(tripId);
        if (!trip) {
            throw new Error(`Trip with ID ${tripId} not found`);
        }
        return trip;
    } catch (error) {
        throw new Error(`Failed to fetch trip: ${error.message}`);
    }
};



