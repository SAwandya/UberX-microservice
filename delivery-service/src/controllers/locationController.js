// const locationService = require('../services/locationService');

// exports.updateRiderLocation = async (req, res, next) => {
//     try {
//         const { rider_id } = req.params;
//         const { trip_id, latitude, longitude } = req.body;

//         if (!rider_id || !trip_id || !latitude || !longitude) {
//             return res.status(400).json({
//                 error: { message: 'rider_id, trip_id, latitude, and longitude are required', status: 400 }
//             });
//         }

//         const location = await locationService.updateRiderLocation(rider_id, trip_id, { latitude, longitude });

//         // Broadcast to WebSocket clients
//         req.io.to(`trip:${trip_id}`).emit('rider_location_updated', {
//             rider_id,
//             ...location,
//         });

//         res.json({ status: 'success' });
//     } catch (error) {
//         next(error);
//     }
// };

// exports.getRiderLocation = async (req, res, next) => {
//     try {
//         const { rider_id } = req.params;
//         const location = await locationService.getRiderLocation(rider_id);
//         if (!location) {
//             return res.status(404).json({
//                 error: { message: 'Location not found', status: 404 }
//             });
//         }
//         res.json(location);
//     } catch (error) {
//         next(error);
//     }
// };