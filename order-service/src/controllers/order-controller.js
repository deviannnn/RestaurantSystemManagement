const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const { OrderService, OrderItemService, RabbitMQService } = require('../services');

// Function to handle add order items
async function processAddOrderItems(orderId, itemDatas) {
    const orderItemsToCreate = [];
    const failures = [];

    await Promise.allSettled(
        itemDatas.map(async (itemData) => {
            try {
                const existingOrderItem = await OrderItemService.findOrderItemInPending(orderId, itemData.itemId);

                if (existingOrderItem) {
                    const newQuantity = existingOrderItem.quantity + itemData.quantity;
                    const newAmount = newQuantity * itemData.price;
                    await OrderItemService.updateOrderItem({
                        id: existingOrderItem.id,
                        quantity: newQuantity,
                        amount: newAmount
                    });
                } else {
                    orderItemsToCreate.push({
                        orderId,
                        itemId: itemData.itemId,
                        quantity: itemData.quantity,
                        price: itemData.price,
                        amount: itemData.quantity * itemData.price
                    });
                }
            } catch (error) {
                failures.push({ id: itemData.itemId, name: itemData.name });
            }
        })
    );

    if (orderItemsToCreate.length > 0) {
        try {
            await OrderItemService.bulkCreateOrderItems(orderItemsToCreate);
        } catch (error) {
            failures.push(...orderItemsToCreate.map(item => ({ id: item.itemId, name: item.name })));
        }
    }

    if (failures.length > 0) {
        const error = new Error('Some items could not be added to order');
        error.status = 500;
        error.data = { orderItems: failures };
        throw error;
    }

    const updatedOrder = await OrderService.getOrderById(orderId);
    return updatedOrder.toJSON();
}


module.exports = {
    /** Expected Input
     * 
     * tableId = req.body;
     * 
     */
    createOrder: [
        inputChecker.checkBodyTable,
        inputChecker.checkTableExist,
        inputChecker.checkTableIsFree,
        async (req, res, next) => {
            try {
                const tableId = req.table.id;
                const userId = req.user.id;

                const newOrder = await OrderService.createOrder(tableId, userId);

                /// Fanout Exchange
                await RabbitMQService.publishOnOrderCreated(newOrder.toJSON()).catch(err => {
                    console.error('Error publishing On Order Created:', err);
                });

                res.status(201).json({
                    success: true,
                    message: 'New order was created successfully!',
                    data: { order: newOrder }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * 
     */
    async getOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const include = req.query.include === 'true' || req.query.include === '1' ? true : false;

            const order = await OrderService.getOrderById(orderId, include);
            if (!order) return next(createError(404, 'Order not found'));

            res.status(200).json({
                success: true,
                message: 'Get order successfully!',
                data: { order }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { userId, status, fromDate, toDate } = req.query
     * 
     */
    getAllOrders: [
        inputChecker.checkQueryGetAllOrders,
        async (req, res, next) => {
            try {
                let { userId, status, fromDate, toDate } = req.query;

                if (req.user.roleId === 4) userId = req.user.id;
                const orders = await OrderService.getAllOrders(userId, status, fromDate, toDate);

                res.status(200).json({
                    success: true,
                    message: 'Get all orders successfully!',
                    data: { orders }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * { status, active, tableId } = req.body
     * 
     */
    updateOrder: [
        inputChecker.checkBodyUpdateOrder,
        inputChecker.checkTableExist,
        async (req, res, next) => {
            try {
                const { orderId } = req.params;
                const { status, active, tableId } = req.body;

                const updatedOrder = await OrderService.updateOrder({ id: orderId, status, active, tableId });
                if (!updatedOrder) return next(createError(404, 'Order not found'));

                res.status(200).json({
                    sucess: true,
                    message: 'Update order successfully!',
                    data: { order: updatedOrder }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * 
     */
    async deleteOrder(req, res, next) {
        try {
            const { orderId } = req.params;

            const deletedOrder = await OrderService.deleteOrder(orderId);
            if (!deletedOrder) return next(createError(404, 'Order not found'));

            res.status(200).json({
                success: true,
                message: 'Delete order successfully!',
                data: { order: deletedOrder }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * orderId = req.params
     * tableId = req.body;
     * 
     */
    changeTable: [
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyTable,
        inputChecker.checkTableExist,
        inputChecker.checkTableIsFree,
        async (req, res, next) => {
            try {
                // get info of current order
                const orderId = req.order.id;
                const oldTableId = req.order.tableId;

                // get info of new table need to change
                const newTableId = req.table.id;

                const updatedOrder = await OrderService.updateOrder({ id: orderId, tableId: newTableId });

                await RabbitMQService.publishOnOpenCloseTable({ open: oldTableId, close: newTableId }).catch(err => {
                    console.error('Error publishing On Open-Close Table:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Change table successfully!',
                    data: { order: updatedOrder }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * 
     */
    cancelOrder: [
        inputChecker.checkOrderInProgress,
        async (req, res, next) => {
            try {
                const order = req.order;

                const updatedOrder = await OrderService.updateOrder({ id: order.id, status: 'cancelled', active: false });

                await RabbitMQService.publishOnOpenCloseTable({ open: order.tableId, close: null }).catch(err => {
                    console.error('Error publishing On Open-Close Table:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Cancel order successfully!',
                    data: { order: updatedOrder }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * array of { itemId, quantity, note } = req.body.items
     * 
     */
    addItemsToOrder: [
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyItems,
        async (req, res, next) => {
            try {
                const orderId = req.order.id;
                const itemDatas = req.itemDatas; // response expecting an array of { itemId, quantity, note, name, price }

                // add or update order items
                const updatedOrder = await processAddOrderItems(orderId, itemDatas);
                const filteredOrderItems = updatedOrder.orderItems
                    .filter(orderItem =>
                        orderItem.status === 'pending' &&
                        orderItem.active === false &&
                        itemDatas.some(itemData => itemData.itemId === orderItem.itemId)
                    )
                    .map(orderItem => {
                        const matchedItemData = itemDatas.find(itemData => itemData.itemId === orderItem.itemId);
                        return {
                            ...orderItem,
                            note: matchedItemData ? matchedItemData.note : ''
                        };
                    });

                await RabbitMQService.publishOrderToKitchen({
                    type: 'add',
                    orderItems: filteredOrderItems
                }).catch(err => {
                    console.error('Error publishing Order To Kitchen:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Add items to order successfully!',
                    data: { orderItems: filteredOrderItems }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * array of { id, quantity, note } = req.body.orderItems
     * 
     */
    updateItemsToOrder: [
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyOrderItems,
        async (req, res, next) => {
            try {
                const orderId = req.order.id;
                const orderItemDatas = req.updatableOrderItems; // response expecting an array of { id, newQuantity, newAmount, note }
                const failOrderItems = req.failOrderItems;

                await Promise.all(
                    orderItemDatas.map(async (orderItem) => {
                        const { id, newQuantity, newAmount } = orderItem;
                        await OrderItemService.updateOrderItem({
                            id,
                            quantity: newQuantity,
                            amount: newAmount,
                        });
                    })
                );

                let updatedOrder = await OrderService.getOrderById(orderId);
                updatedOrder = updatedOrder.toJSON();

                const filteredOrderItems = updatedOrder.orderItems
                    .filter(orderItem => orderItemDatas.some(orderItemData => orderItemData.id === orderItem.id))
                    .map(orderItem => {
                        const matchedOrderItemData = orderItemDatas.find(orderItemData => orderItemData.id === orderItem.id);
                        return {
                            ...orderItem,
                            note: matchedOrderItemData.note
                        };
                    });

                await RabbitMQService.publishOrderToKitchen({
                    type: 'update',
                    orderItems: filteredOrderItems
                }).catch(err => {
                    console.error('Error publishing Order To Kitchen:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Updated items to order successfully!',
                    data: { orderItems: filteredOrderItems, failOrderItems }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderItemId = req.params
     * 
     */
    requestCancelOrderItem: [
        inputChecker.checkOrderItem,
        async (req, res, next) => {
            try {
                await RabbitMQService.publishOrderToKitchen({
                    type: 'cancel',
                    orderItems: req.orderItem
                });

                res.status(200).json({
                    success: true,
                    message: 'Send request to cancel the order item successfully!',
                    data: {}
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderItemId = req.params
     * { status } = req.body
     * 
     */
    changeOrderItemStatus: [
        inputChecker.checkBodyOrderItemStatus,
        async (req, res, next) => {
            try {
                const orderItemId = req.params.orderItemId;
                const { status } = req.body;

                const updatedOrderItem = await OrderItemService.updateOrderItem({
                    id: orderItemId,
                    status,
                    active: status === 'finished' ? true : false
                });
                if (!updatedOrderItem) return next(createError(404, 'OrderItem not found'));

                await RabbitMQService.publishOrderToWaiter({ updatedOrderItem });

                res.status(200).json({
                    success: true,
                    message: 'Update OrderItem status successfully!',
                    data: { orderItem: updatedOrderItem }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],
};