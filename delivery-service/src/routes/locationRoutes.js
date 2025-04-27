const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/riders/:rider_id/location', authMiddleware, locationController.updateRiderLocation);
// router.get('/riders/:rider_id/location', authMiddleware, locationController.getRiderLocation);

module.exports = router;