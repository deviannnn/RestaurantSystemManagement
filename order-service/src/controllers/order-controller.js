const axios = require('axios');
const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');
const RabbitMQService = require('../services/rabbitmq-service');

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
        inputChecker.checkTable,
        async (req, res, next) => {
            try {
                const table = req.table;
                if (!table || table.status !== 'free') {
                    return next(createError(400, 'Table is currently not free'));
                }

                const { userId } = req.body;

                const newOrder = await OrderService.createOrder(table.id, userId);

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
                next(error);
            }
        }
    ],

    async getOrdersByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { status, fromDate, toDate } = req.body;

            const orders = await OrderService.getOrdersByUser(userId, status, fromDate, toDate);
            res.status(200).json({
                success: true,
                message: 'Get orders successfully!',
                data: { orders }
            });
        } catch (error) {
            next(error);
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
        inputChecker.checkTable,
        async (req, res, next) => {
            try {
                // get current order info
                const orderId = req.order.id;
                const oldTableId = req.order.tableId;

                // get new table need to change info
                const newTableId = req.table.id;

                const updatedOrder = await OrderService.updateOrder({ id: orderId, tableId: newTableId });
                if (updatedOrder) {
                    await RabbitMQService.publishOnChangedTable({ oldTableId, newTableId }).catch(err => {
                        console.error('Error publishing On Changed Table:', err);
                    });

                    res.status(200).json({
                        success: true,
                        message: 'Change table successfully!',
                        data: { order: updatedOrder }
                    });
                }
            } catch (error) {
                next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * { status } = req.body
     * 
     */
    changeOrderStatus: [
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyOrderStatus,
        async (req, res, next) => {
            try {
                const orderId = req.order.id;
                const { status } = req.body;

                const updatedOrder = await OrderService.updateOrder({ id: orderId, status });
                if (updatedOrder) {
                    if (updatedOrder.status === 'finished') {
                        // Pub to Payment Service -> create, update amount
                        // Pub to Table Service -> update status
                    } else if (updatedOrder.status === 'cancelled') {
                        // Pub to Table Service -> update status
                    }
                    res.status(200).json(updatedOrder);
                } else {
                    return next(createError(404, 'Order not found'));
                }
            } catch (error) {
                next(error);
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

                await RabbitMQService.publishOrderItemOnCreated(dataToSend).catch(err => {
                    console.error('Error publishing OrderItem On Created:', err);
                });

                res.status(200).json({ success: true, message: 'Items added to order successfully', data: { order: updatedOrder } });
            } catch (error) {
                console.log(error.message);
                next(error);
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
                    orderId,
                    tableId: updatedOrder.tableId,
                    waiter: updatedOrder.userId,
                    items: updatedOrder.items.map(orderItem => {
                        return orderItems.find(data => data.orderItemId === orderItem.id);
                    })
                }

                await RabbitMQService.publishOrderItemOnUpdated(dataToSend).catch(err => {
                    console.error('Error publishing OrderItem On Updated:', err);
                });

                res.status(200).json({ success: true, message: 'Items updated to order successfully', data: { order: updatedOrder } });
            } catch (error) {
                next(error);
            }
        }
    ],

    async requestCancelOrderItem(req, res, next) {
        try {
            const { orderItemId } = req.params;

            const requestedOrderItem = await OrderItemService.getOrderItemById(orderItemId);
            if (requestedOrderItem) {
                // Pub to Kitchen Service -> new request
                
                res.status(200).json({ msg: 'The request to cancel the items has been sent to the chef' });
            } else {
                return next(createError(404, 'OrderItem not found'));
            }
        } catch (error) {
            next(error);
        }
    },

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
                const { orderItemId } = req.params;
                const { status } = req.body;

                const updatedOrderItem = await OrderItemService.updateOrderItem({ id: orderItemId, status });
                if (updatedOrderItem) {
                    if (updatedOrderItem.status === 'in_progress') {
                        // publish message to 'orders item' exchange
                    } else if (updatedOrderItem.status === 'finished') {
                        // -> update totalQuantity, subAmount
                        // Pub to Waiter Service
                    } else if (updatedOrderItem.status === 'cancelled') {
                        // Pub to Waiter Service
                    }
                    res.status(200).json(updatedOrderItem);
                } else {
                    return next(createError(404, 'OrderItem not found'));
                }
            } catch (error) {
                next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderId = req.params
     * 
     */
    async getOrders(req, res, next) {
        try {
            const { orderId } = req.params;
            let orders;

            if (orderId) {
                orders = await OrderService.getOrderById(orderId);
                if (!orders) return next(createError(404, 'Order not found'));
            } else {
                orders = await OrderService.getAllOrders();
            }

            res.status(200).json({
                success: true,
                message: 'Get orders successfully!',
                data: { orders }
            });
        } catch (error) {
            next(error);
        }
    },

    /** Expected Input
     * 
     * orderId = req.params
     * { totalQuantity, subAmount, status, tableId } = req.body
     * 
     */
    updateOrder: [
        inputChecker.checkBodyUpdateOrder,
        inputChecker.checkTable,
        async (req, res, next) => {
            try {
                const { orderId } = req.params;
                const { totalQuantity, subAmount, status, tableId } = req.body;
                const updatedOrder = await OrderService.updateOrder({ id: orderId, totalQuantity, subAmount, status, tableId });
                if (updatedOrder) {
                    res.status(200).json({
                        sucess: true,
                        message: 'Update order successfully!',
                        data: { order: updatedOrder }
                    });
                } else {
                    return next(createError(404, 'Order not found'));
                }
            } catch (error) {
                next(error);
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
            if (deletedOrder) {
                res.status(200).json({
                    success: true,
                    message: 'Delete order successfully!',
                    data: { order: deletedOrder }
                });
            } else {
                return next(createError(404, 'Order not found'));
            }
        } catch (error) {
            next(error);
        }
    }
};