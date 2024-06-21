const axios = require('axios');
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');

module.exports = {
    async createOrder(req, res) {
        try {
            const { tableId, userId } = req.body;
            const newOrder = await OrderService.createOrder(tableId, userId);

            // publish message to 'orders' exchange

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
            const { id } = req.params;
            const { newTableId } = req.body;

            const updatedOrder = await OrderService.updateOrder({ id, tableId: newTableId });
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

    async closeOrder(req, res) {
        try {
            const { id } = req.params;

            const updatedOrder = await OrderService.updateOrder({ id, status: 'finished' });
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

    async cancelOrder(req, res) {
        try {
            const { id } = req.params;

            const updatedOrder = await OrderService.updateOrder({ id, status: 'cancelled' });
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

    async addItemsToOrder(req, res) {
        try {
            const { orderId } = req.params;
            const { itemId, quantity, note } = req.body; // bulkInsert update later

            const order = await OrderService.getOrderById(orderId);
            if (!order) {
                return res.status(404).json('Order not found');
            }

            // Gọi API để lấy thông tin Item
            // const itemResponse = await axios.get(`http://catalog-service/items/${itemId}`);
            // const item = itemResponse.data;
            // if (!item) {
            //     return res.status(404).json({ error: 'Item not found' });
            // }
            // const price = item.price;
            // const amount = quantity * price;
            // const orderItem = await OrderItemService.createOrderItem(orderId, itemId, quantity, price, amount, note);

            // res.status(200).json(order.item);

            res.status(200).json('dev');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async cancelOrderItem(req, res) {
        try {
            const { id } = req.params;

            const updatedOrderItem = await OrderItemService.updateOrderItem({ id, status: 'cancelled' });
            if (updatedOrderItem) {
                res.status(200).json(updatedOrderItem);

                // publish message to 'orders' exchange

            } else {
                res.status(404).json({ error: 'OrderItem not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async changeStatusOrderItem(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const updatedOrderItem = await OrderItemService.updateOrderItem({ id, status });
            if (updatedOrderItem) {
                if (updatedOrderItem.status === 'in_progress') {
                    // publish message to 'orders item' exchange
                } else if (updatedOrderItem.status === 'finished') {
                    // publish message to 'orders item' exchange
                }
                res.status(200).json(updatedOrderItem);
                // publish message to 'orders' exchange
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