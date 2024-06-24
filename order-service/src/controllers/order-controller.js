const axios = require('axios');
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');
const KitchenService = require('../services/kitchen-service');

module.exports = {
    async createOrder(req, res) {
        try {
            const { tableId, userId } = req.body;
            const newOrder = await OrderService.createOrder(tableId, userId);

            // Pub to Kitchen Service
            // Pub to Table Service
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOrdersByUser(req, res) {
        try {
            const { userId } = req.params;
            const { status, fromDate, toDate } = req.body;

            const orders = await OrderService.getOrdersByUser(userId, status, fromDate, toDate);
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changeTable(req, res) {
        try {
            const { orderId } = req.params;
            const { newTableId } = req.body;

            const updatedOrder = await OrderService.updateOrder({ id: orderId, tableId: newTableId });
            if (updatedOrder) {
                res.status(200).json(updatedOrder);
                // publish message to 'orders' exchange
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changeOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const validStatuses = ['in_progress', 'finished', 'cancelled'];
            // Kiểm tra nếu status không hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

            const updatedOrder = await OrderService.updateOrder({ id: orderId, status });
            if (updatedOrder) {
                if (updatedOrder.status === 'in_progress') {

                } else if (updatedOrder.status === 'finished') {
                    // Pub to Payment Service
                    // Pub to Table Service
                } else if (updatedOrder.status === 'cancelled') {
                    // Pub to Table Service
                }
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async addItemsToOrder(req, res) {
        try {
            const { orderId } = req.params;
            const items = req.body.items; // Expecting an array of items { itemId, quantity, note }

            const order = await OrderService.getOrderById(orderId);
            if (!order) {
                return res.status(404).json('Order not found');
            }

            let itemResponse;
            try {
                // Gọi API batch để kiểm tra các item
                const itemIds = items.map(item => item.itemId);
                itemResponse = await axios.post('http://localhost:5000/api/v1/items/batch', { itemIds });
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    return res.status(400).json(error.response.data);
                } else {
                    throw error;
                }
            }

            const itemDatas = itemResponse.data.data.items;

            // Thực hiện thêm hoặc cập nhật các mục trong đơn hàng
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

            const updatedOrder = await OrderService.getOrderById(orderId);
            res.status(200).json({ success: true, message: 'Items added to order successfully', data: { order: updatedOrder } });

            // Chuẩn bị dữ liệu để gửi đến Kitchen Service
            const kitchenServiceData = items.map(item => {
                const itemData = itemDatas.find(data => data.id === item.itemId);
                return {
                    itemId: item.itemId,
                    name: itemData.name,
                    quantity: item.quantity,
                    note: item.note,
                    time: new Date()
                };
            });

            await KitchenService.publishOrder({
                orderId,
                tableId: order.tableId,
                userId: order.userId,
                items: kitchenServiceData
            }).catch(err => {
                // Log lỗi nếu cần, nhưng không chặn response đã gửi cho client
                console.error('Error publishing to Kitchen Service:', err);
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    },

    async updateItemsToOrder(req, res) {
        try {
            const { orderId } = req.params;
            const items = req.body.items; // Expecting an array of items { orderItemId, quantity, note }

            const itemPromises = items.map(async (item) => {
                const { orderItemId, quantity, note } = item;
                try {
                    const existingOrderItem = await OrderItemService.getOrderItemById(orderItemId);

                    if (existingOrderItem && existingOrderItem.orderId == orderId && existingOrderItem.status === 'pending') {
                        const newQuantity = quantity !== undefined ? quantity : existingOrderItem.quantity;
                        const newAmount = newQuantity * existingOrderItem.price;

                        await OrderItemService.updateOrderItem({
                            id: existingOrderItem.id,
                            quantity: newQuantity,
                            amount: newAmount
                        });
                        return null;
                    } else if (!existingOrderItem) {
                        throw new Error(`OrderItem with id ${orderItemId} not found`);
                    } else if (existingOrderItem.orderId != orderId) {
                        throw new Error(`OrderItem with id ${orderItemId} does not belong to order ${orderId}`);
                    } else {
                        throw new Error('This dish is being prepared, please contact the waiter for assistance');
                    }
                } catch (error) {
                    throw new Error(error);
                }
            });

            const results = await Promise.allSettled(itemPromises);
            console.log(results);
            const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
            if (errors.length > 0) {
                return res.status(400).json({ error: errors.map(e => e.dev) });
            }

            const updatedOrder = await OrderService.getOrderById(orderId);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async requestCancelOrderItem(req, res) {
        try {
            const { orderItemId } = req.params;

            const requestedOrderItem = await OrderItemService.getOrderItemById(orderItemId);
            if (requestedOrderItem) {
                // Pub to Kitchen Service
                res.status(200).json({ msg: 'The request to cancel the items has been sent to the chef' });
            } else {
                res.status(404).json({ error: 'OrderItem not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changeOrderItemStatus(req, res) {
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
                res.status(404).json({ error: 'OrderItem not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOrders(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const order = await OrderService.getOrderById(id);
                if (order) {
                    res.status(200).json(order);
                } else {
                    res.status(404).json({ error: 'Order not found' });
                }
            } else {
                const orders = await OrderService.getAllOrders();
                res.status(200).json(orders);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const { totalQuantity, subAmount, status, tableId } = req.body;
            const updatedOrder = await OrderService.updateOrder({ id, totalQuantity, subAmount, status, tableId });
            if (updatedOrder) {
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const deletedOrder = await OrderService.deleteOrder(id);
            if (deletedOrder) {
                res.status(200).json(deletedOrder);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};