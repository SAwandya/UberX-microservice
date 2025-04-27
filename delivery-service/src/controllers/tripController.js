const tripService = require('../services/tripService');

exports.createTrip = async (req, res, next) => {
    try {
        const { orderId, customerId, startLocation, endLocation } = req.body;

        if (!orderId || !customerId || !startLocation || !endLocation) {
            return res.status(400).json({
                error: { message: 'Missing required fields', status: 400 }
            });
        }

        const tripData = {
            orderId,
            customerId,
            startLocation,
            endLocation
        };

        const newTrip = await tripService.createTripFromOrder(tripData);

        res.status(201).json(newTrip);
    } catch (error) {
        next(error);
    }
};


exports.getTripById = async (req, res, next) => {
    try {
        const tripId = req.params.id;
        const userId = req.user?.id;

        if (!tripId) {
            return res.status(400).json({
                error: { message: 'Trip ID is required', status: 400 }
            });
        }

        const trip = await tripService.getTripById(tripId);

        if (trip.customerId !== userId) {
            return res.status(403).json({
                error: { message: 'Unauthorized to view this trip', status: 403 }
            });
        }

        res.status(200).json(trip);
    } catch (error) {
        next(error);
    }
};

exports.updateTrip = async (req, res, next) => {
    try {
        const tripId = req.params.id;
        const userId = req.user?.id;

        if (!tripId) {
            return res.status(400).json({
                error: { message: 'Trip ID is required', status: 400 }
            });
        }

        const { status } = req.body;
        const updateData = {};

        if (status) {
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: { message: 'No valid update fields provided', status: 400 }
            });
        }

        const updatedTrip = await tripService.updateTrip(tripId, updateData);

        if (updatedTrip.customerId !== userId) {
            return res.status(403).json({
                error: { message: 'Unauthorized to update this trip', status: 403 }
            });
        }

        res.status(200).json({
            message: 'Trip updated successfully',
            trip: updatedTrip
        });
    } catch (error) {
        next(error);
    }
};