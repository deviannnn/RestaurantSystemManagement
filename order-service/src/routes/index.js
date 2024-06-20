const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/order-controller');
const OrderItemController = require('../controllers/order-item-controller');

// Orders CRUD
router.post('/orders', OrderController.createOrder);
router.get('/orders/:id?', OrderController.getOrders);
router.put('/orders/:id', OrderController.updateOrder);
router.delete('/orders/:id', OrderController.deleteOrder);

// OrdersItems CRUD
router.post('/orders-items', OrderItemController.createOrderItem);
router.get('/orders-items/:id?', OrderItemController.getOrderItems);
router.put('/orders-items/:id', OrderItemController.updateOrderItem);
router.delete('/orders-items/:id', OrderItemController.deleteOrderItem);
// Sử dụng các router khác...

module.exports = router;