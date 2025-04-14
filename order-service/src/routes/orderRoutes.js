const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/latest', orderController.getLatestOrder);
router.get('/:id', orderController.getOrderById);


module.exports = router;