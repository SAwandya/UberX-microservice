const pool = require('../config/database');
const Rider = require('../models/rider');

exports.findAvailableRider = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [riders] = await connection.query(
            'SELECT * FROM riders WHERE isAvailable = TRUE LIMIT 1 FOR UPDATE'
        );

        if (!riders.length) {
            throw new Error('No available riders');
        }

        const rider = riders[0];

        await connection.query(
            'UPDATE riders SET isAvailable = FALSE WHERE id = ?',
            [rider.id]
        );

        await connection.commit();

        return new Rider(
            rider.id,
            rider.name,
            rider.isAvailable,
            rider.created_at,
            rider.updated_at
        );
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error finding available rider:', error);
        throw new Error(`Database error finding rider: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};

exports.updateRiderAvailability = async (riderId, isAvailable) => {
    try {
        await pool.execute(
            'UPDATE riders SET isAvailable = ? WHERE id = ?',
            [isAvailable, riderId]
        );
        const [rows] = await pool.execute('SELECT * FROM riders WHERE id = ?', [riderId]);
        if (rows.length === 0) return null;
        const rider = rows[0];
        return new Rider(
            rider.id,
            rider.name,
            rider.isAvailable,
            rider.created_at,
            rider.updated_at
        );
    } catch (error) {
        console.error('Error updating rider availability:', error);
        throw new Error(`Database error updating rider: ${error.message}`);
    }
};

exports.createRider = async (riderData) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO riders (name, isAvailable) VALUES (?, ?)',
            [riderData.name, riderData.isAvailable]
        );

        const newRiderId = result.insertId;

        await connection.commit();

        return new Rider(
            newRiderId,
            riderData.name,
            riderData.isAvailable,
            new Date(),
            new Date()
        );
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating rider:', error);
        throw new Error(`Database error during rider creation: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
};