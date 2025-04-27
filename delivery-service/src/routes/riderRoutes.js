const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');

const authMiddleware = require('../middleware/authMiddleware');

// Route to create a new rider
router.post('/', riderController.createRider);

module.exports = router;
