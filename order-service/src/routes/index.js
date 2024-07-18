const express = require('express');
const router = express.Router();

const { OrderController, OrderItemController } = require('../controllers');

// Orders CRUD
router.post('/orders', OrderController.createOrder);
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:orderId', OrderController.getOrder);
router.put('/orders/:orderId', OrderController.updateOrder);
router.delete('/orders/:orderId', OrderController.deleteOrder);

// Orders Business Logic
router.put('/orders/:orderId/change-table', OrderController.changeTable);
router.put('/orders/:orderId/cancel', OrderController.cancelOrder);
router.post('/orders/:orderId/add-items', OrderController.addItemsToOrder);
router.put('/orders/:orderId/updated-items', OrderController.updateItemsToOrder);


// OrdersItems CRUD
router.post('/orders-items', OrderItemController.createOrderItem);
router.get('/orders-items/:orderItemId?', OrderItemController.getOrderItems);
router.put('/orders-items/:orderItemId', OrderItemController.updateOrderItem);
router.delete('/orders-items/:orderItemId', OrderItemController.deleteOrderItem);

// OrdersItems Business Logic
router.post('/orders-items/:orderItemId/request-cancel', OrderController.requestCancelOrderItem);
router.put('/orders-items/:orderItemId/change-status', OrderController.changeOrderItemStatus);


module.exports = router;