// const redis = require('redis');
// const { REDIS_HOST, REDIS_PORT } = require('../config/environment');

// const redisClient = redis.createClient({
//     url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));
// redisClient.connect();

// exports.updateRiderLocation = async (riderId, tripId, { latitude, longitude }) => {
//     try {
//         const location = { latitude, longitude, timestamp: new Date().toISOString() };

//         // Store in Redis with a 5-minute expiry
//         await redisClient.set(
//             `rider:${riderId}:location`,
//             JSON.stringify(location),
//             { EX: 60 * 5 }
//         );

//         return location;
//     } catch (error) {
//         throw new Error(`Failed to update rider location: ${error.message}`);
//     }
// };

// exports.getRiderLocation = async (riderId) => {
//     try {
//         const location = await redisClient.get(`rider:${riderId}:location`);
//         return location ? JSON.parse(location) : null;
//     } catch (error) {
//         throw new Error(`Failed to fetch rider location: ${error.message}`);
//     }
// };