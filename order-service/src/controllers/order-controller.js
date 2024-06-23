const axios = require('axios');
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');

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
            
            const itemPromises = items.map(async (item) => {
                const { itemId, quantity, note } = item;
                try {
                    // Gọi API để lấy thông tin Item
                    const itemResponse = await axios.get(`http://localhost:5000/api/v1/items/${itemId}`);
                    const itemData = itemResponse.data;
    
                    if (!itemData) {
                        throw new Error(`Item with id ${itemId} not found`);
                    }
    
                    const existingOrderItem = await OrderItemService.getByOrderIdAndItemId(orderId, itemId);
                    if (existingOrderItem) {
                        const newQuantity = existingOrderItem.quantity + quantity;
                        const newAmount = newQuantity * itemData.price;
                        await OrderItemService.updateOrderItem({ id: existingOrderItem.id, quantity: newQuantity, amount: newAmount });
                        return null;
                    } else {
                        return {
                            orderId,
                            itemId,
                            quantity,
                            price: itemData.price,
                            amount: quantity * itemData.price,
                            note
                        };
                    }
                } catch (error) {
                    throw new Error(`Error fetching item with id ${itemId}: ${error.message}`);
                }
            });

            const results = await Promise.allSettled(itemPromises);

            const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
            if (errors.length > 0) {
                return res.status(400).json({ error: errors.map(e => e.message) });
            }

            // Loại bỏ các mục null (những mục đã được cập nhật)
            const validOrderItemsToCreate = results
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);

            if (validOrderItemsToCreate.length > 0) {
                await OrderItemService.bulkCreateOrderItems(validOrderItemsToCreate);
            }

            // Pub to Kitchen Service { orderId, tableId, [{ itemId, quantity, note, createdAt }] }

            const updatedOrder = await OrderService.getOrderById(orderId);
            res.status(200).json(updatedOrder);
        } catch (error) {
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
                        const newNote = note !== undefined ? note : existingOrderItem.note;
                        const newAmount = newQuantity * existingOrderItem.price;

                        await OrderItemService.updateOrderItem({
                            id: existingOrderItem.id,
                            quantity: newQuantity,
                            amount: newAmount,
                            note: newNote
                        });
                        return null;
                    } else if (!existingOrderItem) {
                        throw new Error(`OrderItem with id ${orderItemId} not found`);
                    } else if (existingOrderItem.orderId != orderId) {
                        throw new Error(`OrderItem with id ${orderItemId} does not belong to order ${orderId}`);
                    } else {
                        throw new Error(`OrderItem with id ${orderItemId} is not in pending status`);
                    }
                } catch (error) {
                    throw new Error(`Error processing orderItem with id ${orderItemId}: ${error.message}`);
                }
            });

            const results = await Promise.allSettled(itemPromises);

            const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
            if (errors.length > 0) {
                return res.status(400).json({ error: errors.map(e => e.message) });
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