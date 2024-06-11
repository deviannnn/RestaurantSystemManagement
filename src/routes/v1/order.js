const express = require('express');
const router = express.Router();
const OrderController = require('../../controllers/order.controller');

router.post('/', OrderController.createOrder);
router.get('/:id?', OrderController.getOrders);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;