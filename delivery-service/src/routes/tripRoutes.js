const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:id', tripController.getTripById);
router.patch('/:id', authMiddleware, tripController.updateTrip);
router.post('/', tripController.createTrip);

module.exports = router;