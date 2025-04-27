const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:id', authMiddleware, tripController.getTripById);
router.patch('/:id', authMiddleware, tripController.updateTrip);
router.post('/', authMiddleware, tripController.createTrip);

module.exports = router;