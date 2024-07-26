const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const { OrderService, OrderItemService, RabbitMQService } = require('../services');

// Function to handle add order items
async function processAddOrderItems(orderId, itemDatas) {
    const orderItemsToCreate = [];
    const failedItems = [];

    await Promise.allSettled(
        itemDatas.map(async (itemData) => {
            try {
                const existingOrderItem = await OrderItemService.getByOrderIdAndItemId(orderId, itemData.itemId);

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
                console.error(`Error processing item ${itemData.itemId}:`, error);
                failedItems.push({ itemId: itemData.itemId, name: itemData.name });
            }
        })
    );

    if (orderItemsToCreate.length > 0) {
        try {
            await OrderItemService.bulkCreateOrderItems(orderItemsToCreate);
        } catch (error) {
            console.error('Error bulk creating order items:', error);
            failedItems.push(...orderItemsToCreate.map(item => ({ itemId: item.itemId, name: item.name })));
        }
    }

    if (failedItems.length > 0) {
        const error = new Error('Some items could not be added to order');
        error.status = 500;
        error.data = { failedItems };
        throw error;
    }

    const updatedOrder = await OrderService.getOrderById(orderId);
    return updatedOrder.toJSON();
}


// Function to handle update orderItems
async function processUpdateOrderItems(orderId, orderItems) {
    const failedItems = [];

    await Promise.allSettled(
        orderItems.map(async (orderItem) => {
            try {
                const { orderItemId, quantity, note } = orderItem;
                const existingOrderItem = await OrderItemService.getOrderItemById(orderItemId);

                if (!existingOrderItem) {
                    throw new Error(`OrderItem with id ${orderItemId} not found`);
                }
                if (existingOrderItem.orderId !== orderId) {
                    throw new Error(`OrderItem with id ${orderItemId} does not belong to order ${orderId}`);
                }
                if (existingOrderItem.status !== 'pending') {
                    throw new Error('This dish is being prepared, please contact the waiter for assistance');
                }

                const newQuantity = quantity !== undefined ? quantity : existingOrderItem.quantity;
                const newAmount = newQuantity * existingOrderItem.price;

                await OrderItemService.updateOrderItem({
                    id: existingOrderItem.id,
                    quantity: newQuantity,
                    amount: newAmount,
                    note: note !== undefined ? note : existingOrderItem.note
                });

                return null;
            } catch (error) {
                console.error(`Error processing order item ${orderItem.orderItemId}:`, error);
                failedItems.push({ orderItemId: orderItem.orderItemId, detail: error.message });
            }
        })
    );

    if (failedItems.length > 0) {
        const error = new Error('Some order items could not be updated');
        error.status = 500;
        error.data = { failedItems };
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

            const order = await OrderService.getOrderById(orderId);
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

    async getAllOrders(req, res, next) {
        try {
            const orders = await OrderService.getAllOrders();

            res.status(200).json({
                success: true,
                message: 'Get all orders successfully!',
                data: { orders }
            });
        } catch (error) {
            return next(error);
        }
    },

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

                const dataToSend = { open: oldTableId, close: newTableId };
                await RabbitMQService.publishOnOpenCloseTable(dataToSend).catch(err => {
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

                const dataToSend = { open: order.tableId, close: null };
                await RabbitMQService.publishOnOpenCloseTable(dataToSend).catch(err => {
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

                const dataToSend = {
                    type: 'add',
                    orderId,
                    tableId: updatedOrder.tableId,
                    waiter: updatedOrder.userId,
                    items: updatedOrder.items.map(orderItem => {
                        const itemData = itemDatas.find(data => data.itemId === orderItem.itemId);
                        return {
                            orderItemId: orderItem.id,
                            ...itemData
                        };
                    })
                }

                await RabbitMQService.publishOrderToKitchen(dataToSend).catch(err => {
                    console.error('Error publishing Order To Kitchen:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Items added to order successfully!',
                    data: { order: updatedOrder }
                });
            } catch (error) {
                console.log(error.message);
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * array of { orderItemId, quantity, note } = req.body.orderItems
     * 
     */
    updateItemsToOrder: [
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyOrderItems,
        async (req, res, next) => {
            try {
                const orderId = req.order.id;
                const orderItems = req.body.orderItems;

                const updatedOrder = await processUpdateOrderItems(orderId, orderItems);

                const dataToSend = {
                    type: 'update',
                    orderId,
                    tableId: updatedOrder.tableId,
                    waiter: updatedOrder.userId,
                    items: updatedOrder.items.map(orderItem => {
                        return orderItems.find(data => data.orderItemId === orderItem.id);
                    })
                }

                await RabbitMQService.publishOrderToKitchen(dataToSend).catch(err => {
                    console.error('Error publishing Order To Kitchen:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'Items updated to order successfully!',
                    data: { order: updatedOrder }
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
                const orderItem = req.orderItem;

                const dataToSend = { type: 'cancel', items: orderItem };
                await RabbitMQService.publishOrderToKitchen(dataToSend).catch(err => {
                    console.error('Error publishing Order To Kitchen:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'The request to cancel the order items has been sent to the chef!',
                    data: { orderItem }
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
        inputChecker.checkOrderItem,
        inputChecker.checkBodyOrderItemStatus,
        async (req, res, next) => {
            try {
                const orderItem = req.orderItem;
                const { status } = req.body;
                const updatePayload = { id: orderItem.id, status, active: status === 'finished' ? true : false };

                const updatedOrderItem = await OrderItemService.updateOrderItem(updatePayload);

                const dataToSend = { updatedOrderItem };
                await RabbitMQService.publishOrderToWaiter(dataToSend).catch(err => {
                    console.error('Error publishing Order To Waiter:', err);
                });

                res.status(200).json({
                    success: true,
                    message: 'OrderItem updated to order successfully!',
                    data: { orderItem: updatedOrderItem }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],
};