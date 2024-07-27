const express = require('express');
const router = express.Router();

const { OrderController, OrderItemController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');


router.use(authenticate);

// Orders CRUD
router.post('/orders', authorize(["manager", "waiter"]), OrderController.createOrder);
router.get('/orders', authorize(["manager", "waiter"]), OrderController.getAllOrders); // req.query.userId, status, fromDate, toDate ?
router.get('/orders/:orderId', authorize(["manager", "waiter"]), OrderController.getOrder); // req.query.include ?
router.put('/orders/:orderId', authorize(["admin", "manager"]), OrderController.updateOrder);
router.delete('/orders/:orderId', authorize(["admin"]), OrderController.deleteOrder);

// Orders Business Logic
router.put('/orders/:orderId/change-table', authorize(["manager", "waiter"]), OrderController.changeTable);
router.put('/orders/:orderId/cancel', authorize(["manager"]), OrderController.cancelOrder);
router.post('/orders/:orderId/add-items', authorize(["waiter"]), OrderController.addItemsToOrder);
router.put('/orders/:orderId/updated-items', authorize(["waiter"]), OrderController.updateItemsToOrder);


// OrdersItems CRUD
router.post('/orders-items', authorize(["admin", "manager"]), OrderItemController.createOrderItem);
router.get('/orders-items/:orderItemId?', OrderItemController.getOrderItems);
router.put('/orders-items/:orderItemId', authorize(["admin", "manager"]), OrderItemController.updateOrderItem);
router.delete('/orders-items/:orderItemId', authorize(["admin", "manager"]), OrderItemController.deleteOrderItem);

// OrdersItems Business Logic
router.post('/orders-items/:orderItemId/request-cancel', authorize(["waiter"]), OrderController.requestCancelOrderItem);
router.put('/orders-items/:orderItemId/change-status', authorize(["manager", "chef"]), OrderController.changeOrderItemStatus);


module.exports = router;