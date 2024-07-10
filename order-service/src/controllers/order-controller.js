const axios = require('axios');
const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');
const RabbitMQService = require('../services/rabbitmq-service');

// // Function to check the validity of the table -> Expecting an { id } of table
// async function fetchToGetTable(tableId) {
//     try {
//         const response = await axios.get(`${TableService}/api/v1/tables/${tableId}`);
//         return response.data.data.table;
//     } catch (error) {
//         throw error;
//     }
// }

// async function validateTableStatus(req, res, next) {
//     const tableId = req.body.tableId;
//     if (!tableId) {
//         return next(createError(400, 'Table ID is required'));
//     }
//     try {
//         const tableData = await fetchToGetTable(tableId);
//         if (tableData.status !== 'free') {
//             return next(createError(400, 'Table is currently not free'));
//         }
//         next();
//     } catch (error) {
//         return res.status(error.response.status).json(error.response.data);
//     }
// }

// Function to handle add order items
async function processAddOrderItems(orderId, itemDatas) {
    const orderItemsToCreate = [];

    try {
        const orderItemPromises = itemDatas.map(async (itemData) => {
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
            }
        });

        await Promise.all(orderItemPromises);

        if (orderItemsToCreate.length > 0) {
            await OrderItemService.bulkCreateOrderItems(orderItemsToCreate);
        }

        const updatedOrder = await OrderService.getOrderById(orderId);
        return updatedOrder.toJSON();
    } catch (error) {
        console.error('Error processing order items:', error);
        throw error;
    }
}

// Function to handle update order items
async function processUpdateOrderItems(orderId, items) {
    return await Promise.allSettled(
        items.map(async (item) => {
            const { orderItemId, quantity, note } = item;
            const existingOrderItem = await OrderItemService.getOrderItemById(orderItemId);

            if (!existingOrderItem) {
                throw new Error(`OrderItem with id ${orderItemId} not found`);
            }
            if (existingOrderItem.orderId != orderId) {
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
        })
    );
}

module.exports = {
    createOrder: [inputChecker.checkTableStatus, async (req, res, next) => {
        try {
            const { tableId, userId } = req.body;

            const newOrder = await OrderService.createOrder(tableId, userId);

            /// Fanout Exchange
            await RabbitMQService.publishOnOrderCreated(newOrder.toJSON()).catch(err => {
                console.error('Error publishing to Exchange:', err);
            });

            res.status(201).json({
                success: true,
                message: 'New order was created successfully',
                data: { order: newOrder }
            });
        } catch (error) {
            next(error);
        }
    }],

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

    changeTable: [inputChecker.checkTableStatus, async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const { tableId } = req.body;

            // get info of current order with { orderId }
            const currentOrder = await OrderService.getOrderById(orderId);
            if (!currentOrder) {
                return next(createError(404, 'Order not found'));
            }

            const updatedOrder = await OrderService.updateOrder({ id: orderId, tableId });
            if (updatedOrder) {
                // Pub to Table Service -> update status
                await RabbitMQService.publishOnChangedTable({ oldTableId: currentOrder.tableId, newTableId: tableId }).catch(err => {
                    console.error('Error publishing to Table Service:', err);
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
    }],

    async changeOrderStatus(req, res, next) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const validStatuses = ['in_progress', 'finished', 'cancelled'];
            // Kiểm tra nếu status không hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ sucess: false, error: { message: 'Invalid status value', data: {} } });
            }

            const updatedOrder = await OrderService.updateOrder({ id: orderId, status });
            if (updatedOrder) {
                if (updatedOrder.status === 'in_progress') {

                } else if (updatedOrder.status === 'finished') {
                    // Pub to Payment Service -> update amount
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
    },

    // Expecting an array of req.body.items as { itemId, quantity, note }
    addItemsToOrder: [inputChecker.checkAddItemsToOrder, async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const itemDatas = req.itemDatas;  // Response expecting an array of items as { itemId, quantity, note, name, price }

            // Thêm hoặc cập nhật các order items
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
                // Log lỗi nếu cần, nhưng không chặn response đã gửi cho client
                console.error('Error publishing to Kitchen Service:', err);
            });

            res.status(200).json({ success: true, message: 'Items added to order successfully', data: { order: updatedOrder } });
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    }],

    async updateItemsToOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const items = req.body.items; // Expecting an array of items { orderItemId, quantity, note }

            const results = await processUpdateOrderItems(orderId, items);
            const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);

            if (errors.length > 0) {
                return res.status(400).json({ success: false, error: errors.map(e => e.message) });
            }

            const updatedOrder = await OrderService.getOrderById(orderId);
            res.status(200).json({ success: true, message: 'Items updated to order successfully', data: { order: updatedOrder } });

            const updatedOrderJSON = updatedOrder.toJSON();
            updatedOrderJSON.items = updatedOrderJSON.items.map(orderItem => {
                const item = items.find(item => item.orderItemId === orderItem.id);
                return {
                    ...orderItem,
                    note: item ? item.note : null
                };
            });

            await RabbitMQService.publishOrderItemOnUpdated(updatedOrderJSON).catch(err => {
                // Log lỗi nếu cần, nhưng không chặn response đã gửi cho client
                console.error('Error publishing to Kitchen Service:', err);
            });
        } catch (error) {
            next(error);
        }
    },

    async requestCancelOrderItem(req, res, next) {
        try {
            const { orderItemId } = req.params;

            const requestedOrderItem = await OrderItemService.getOrderItemById(orderItemId);
            if (requestedOrderItem) {
                // Pub to Kitchen Service -> new request
                res.status(200).json({ msg: 'The request to cancel the items has been sent to the chef' });
            } else {
                res.status(404).json({ sucess: false, error: { message: 'OrderItem not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },

    async changeOrderItemStatus(req, res, next) {
        try {
            const { orderItemId } = req.params;
            const { status } = req.body;

            const validStatuses = ['in_progress', 'finished', 'cancelled'];
            // Kiểm tra nếu status không hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

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
                res.status(404).json({ sucess: false, error: { message: 'OrderItem not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },

    async getOrders(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const order = await OrderService.getOrderById(id);
                if (order) {
                    res.status(200).json({
                        sucess: true,
                        message: 'Get order successfully!',
                        data: { order }
                    });
                } else {
                    return next(createError(404, 'Order not found'));
                }
            } else {
                const orders = await OrderService.getAllOrders();
                res.status(200).json({
                    sucess: true,
                    message: 'Get all orders successfully!',
                    data: { orders }
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async updateOrder(req, res, next) {
        try {
            const { id } = req.params;
            const { totalQuantity, subAmount, status, tableId } = req.body;
            const updatedOrder = await OrderService.updateOrder({ id, totalQuantity, subAmount, status, tableId });
            if (updatedOrder) {
                res.status(200).json({
                    sucess: true,
                    message: 'Update order successfully!',
                    data: { updatedOrder }
                });
            } else {
                return next(createError(404, 'Order not found'));
            }
        } catch (error) {
            next(error);
        }
    },

    async deleteOrder(req, res, next) {
        try {
            const { id } = req.params;
            const deletedOrder = await OrderService.deleteOrder(id);
            if (deletedOrder) {
                res.status(200).json({
                    success: true,
                    message: 'Delete order successfully!',
                    data: { deletedOrder }
                });
            } else {
                return next(createError(404, 'Order not found'));
            }
        } catch (error) {
            next(error);
        }
    }
};