const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/order-controller');
const OrderItemController = require('../controllers/order-item-controller');

// Orders CRUD
router.post('/orders', OrderController.createOrder);
router.get('/orders/:id?', OrderController.getOrders);
router.put('/orders/:id', OrderController.updateOrder);
router.delete('/orders/:id', OrderController.deleteOrder);

// Orders Business Logic
router.get('/orders/users/:userId', OrderController.getOrdersByUser);
router.put('/orders/:orderId/change-table', OrderController.changeTable);
router.put('/orders/:orderId/change-status', OrderController.changeOrderStatus);
router.post('/orders/:orderId/add-items', OrderController.addItemsToOrder);
router.put('/orders/:orderId/updated-items', OrderController.updateItemsToOrder);


// OrdersItems CRUD
router.post('/orders-items', OrderItemController.createOrderItem);
router.get('/orders-items/:id?', OrderItemController.getOrderItems);
router.put('/orders-items/:id', OrderItemController.updateOrderItem);
router.delete('/orders-items/:id', OrderItemController.deleteOrderItem);

// OrdersItems Business Logic
router.post('/orders-items/:orderItemId/request-cancel', OrderController.requestCancelOrderItem);
router.put('/orders-items/:orderItemId/change-status', OrderController.changeOrderItemStatus);


module.exports = router;