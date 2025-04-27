const pool = require('../config/database');
const Trip = require('../models/trip');
const { TRIP_STATUS } = require('../utils/constants');

exports.createTrip = async (tripData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const tripSql = `INSERT INTO trips (orderId, riderId, customerId, status, startLocation, endLocation)
                         VALUES (?, ?, ?, ?, ?, ?)`;
        const tripValues = [
            tripData.orderId,
            tripData.riderId,
            tripData.customerId,
            tripData.status || TRIP_STATUS.PENDING,
            JSON.stringify(tripData.startLocation),
            JSON.stringify(tripData.endLocation),
        ];
        const [tripResult] = await connection.execute(tripSql, tripValues);
        const newTripId = tripResult.insertId;

        await connection.commit();

        return new Trip(
            newTripId,
            tripData.orderId,
            tripData.riderId,
            tripData.customerId,
            tripData.status || TRIP_STATUS.PENDING,
            tripData.startLocation,
            tripData.endLocation
        );
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating trip in repository:', error);
        throw new Error(`Database error during trip creation: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

exports.findTripById = async (tripId) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM trips WHERE id = ?", [tripId]);
        if (rows.length === 0) return null;
        const trip = rows[0];
        return new Trip(
            trip.id,
            trip.orderId,
            trip.riderId,
            trip.customerId,
            trip.status,
            JSON.parse(trip.startLocation),
            JSON.parse(trip.endLocation),
            trip.created_at,
            trip.updated_at
        );
    } catch (error) {
        console.error('Error finding trip by ID:', error);
        throw new Error(`Database error finding trip: ${error.message}`);
    }
};

exports.updateTrip = async (tripId, updateData) => {
    try {
        const updateFields = [];
        const values = [];

        if (updateData.status !== undefined) {
            updateFields.push('status = ?');
            values.push(updateData.status);
        }
        if (updateData.riderId !== undefined) {
            updateFields.push('riderId = ?');
            values.push(updateData.riderId);
        }

        if (updateFields.length === 0) {
            return await exports.findTripById(tripId);
        }

        values.push(tripId);

        await pool.execute(
            `UPDATE trips SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        return await exports.findTripById(tripId);
    } catch (error) {
        console.error('Error updating trip:', error);
        throw new Error(`Database error updating trip: ${error.message}`);
    }
};