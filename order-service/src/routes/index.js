const express = require('express');
const router = express.Router();

const { OrderController, OrderItemController } = require('../controllers');
const { authorize } = require('../middlewares/auth');


// Orders CRUD
router.post('/orders', authorize(["manager", "staff"]), OrderController.createOrder);
router.get('/orders', authorize(["manager", "staff"]), OrderController.getAllOrders);
router.get('/orders/:orderId', authorize(["manager", "staff"]), OrderController.getOrder);
router.put('/orders/:orderId', authorize(["admin", "manager"]), OrderController.updateOrder);
router.delete('/orders/:orderId', authorize(["admin"]), OrderController.deleteOrder);

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