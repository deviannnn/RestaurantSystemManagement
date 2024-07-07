const axios = require('axios');
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');
const RabbitMQService = require('../services/rabbitmq-service');

const CatalogService = process.env.CATALOG_SERVICE_HOSTNAME || 'http://localhost:5000';

// Hàm kiểm tra các item -> Expecting an array of items { itemId, quantity, note }
async function checkItems(items) {
    try {
        const itemIds = items.map(item => item.itemId);
        const itemResponse = await axios.post(`${CatalogService}/api/v1/items/batch`, { itemIds });
        return itemResponse.data.data.items;
    } catch (error) {
        throw error;
    }
}

// Hàm xử lý add order items
async function processAddOrderItems(orderId, items, itemDatas) {
    const orderItemsToCreate = [];
    const orderItemPromises = items.map(async (item) => {
        const itemData = itemDatas.find(data => data.id === item.itemId);
        const existingOrderItem = await OrderItemService.getByOrderIdAndItemId(orderId, item.itemId);
        if (existingOrderItem) {
            const newQuantity = existingOrderItem.quantity + item.quantity;
            const newAmount = newQuantity * itemData.price;
            await OrderItemService.updateOrderItem({
                id: existingOrderItem.id,
                quantity: newQuantity,
                amount: newAmount
            });
        } else {
            orderItemsToCreate.push({
                orderId,
                itemId: item.itemId,
                quantity: item.quantity,
                price: itemData.price,
                amount: item.quantity * itemData.price
            });
        }
    });

    await Promise.allSettled(orderItemPromises);

    if (orderItemsToCreate.length > 0) {
        await OrderItemService.bulkCreateOrderItems(orderItemsToCreate);
    }
}

// Hàm xử lý update order items
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
    async createOrder(req, res, next) {
        try {
            const { tableId, userId } = req.body;

            // validate free table

            const newOrder = await OrderService.createOrder(tableId, userId);

            // Pub to Kitchen Service -> new order
            // Pub to Table Service -> update status

            res.status(201).json(newOrder);
        } catch (error) {
            next(error);
        }
    },

    async getOrdersByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { status, fromDate, toDate } = req.body;

            const orders = await OrderService.getOrdersByUser(userId, status, fromDate, toDate);
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    },

    async changeTable(req, res, next) {
        try {
            const { orderId } = req.params;
            const { newTableId } = req.body;

            // validate free table

            const updatedOrder = await OrderService.updateOrder({ id: orderId, tableId: newTableId });
            if (updatedOrder) {
                res.status(200).json(updatedOrder);

                // Pub to Table Service -> update status

            } else {
                res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },

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
                res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },

    async addItemsToOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const items = req.body.items; // Expecting an array of items { itemId, quantity, note }

            const order = await OrderService.getOrderById(orderId);
            if (!order) {
                res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
            }

            let itemDatas;
            try {
                itemDatas = await checkItems(items);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    return res.status(400).json(error.response.data);
                }
                throw error;
            }

            // Thêm hoặc cập nhật các order items
            await processAddOrderItems(orderId, items, itemDatas);

            const updatedOrder = await OrderService.getOrderById(orderId);
            res.status(200).json({ success: true, message: 'Items added to order successfully', data: { order: updatedOrder } });

            const updatedOrderJSON = updatedOrder.toJSON();
            updatedOrderJSON.items = updatedOrderJSON.items.map(orderItem => {
                const item = items.find(item => item.itemId === orderItem.itemId);
                const itemData = itemDatas.find(data => data.id === orderItem.itemId);
                return {
                    ...orderItem,
                    name: itemData ? itemData.name : null,
                    note: item ? item.note : null
                };
            });

            await RabbitMQService.publishOrderItemOnCreated(updatedOrderJSON).catch(err => {
                // Log lỗi nếu cần, nhưng không chặn response đã gửi cho client
                console.error('Error publishing to Kitchen Service:', err);
            });
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },

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
                    res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
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
                res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
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
                res.status(404).json({ sucess: false, error: { message: 'Order not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    }
};