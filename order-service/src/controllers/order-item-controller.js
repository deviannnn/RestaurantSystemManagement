const OrderItemService = require('../services/order-item-service');

module.exports = {
    async createOrderItem(req, res) {
        try {
            const { orderId, itemId, quantity, price, amount, note, status, active } = req.body;
            const newOrderItem = await OrderItemService.createOrderItem(orderId, itemId, quantity, price, amount, note, status, active);
            res.status(201).json(newOrderItem);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getOrderItems(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const orderItem = await OrderItemService.getOrderItemById(id);
                if (orderItem) {
                    res.status(200).json(orderItem);
                } else {
                    res.status(404).json({ error: 'Order item not found' });
                }
            } else {
                const orderItems = await OrderItemService.getAllOrderItems();
                res.status(200).json(orderItems);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateOrderItem(req, res) {
        try {
            const { id } = req.params;
            const { orderId, itemId, quantity, price, amount, note, status, active } = req.body;
            const updatedOrderItem = await OrderItemService.updateOrderItem({ id, orderId, itemId, quantity, price, amount, note, status, active });
            if (updatedOrderItem) {
                res.status(200).json(updatedOrderItem);
            } else {
                res.status(404).json({ error: 'Order item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteOrderItem(req, res) {
        try {
            const { id } = req.params;
            const deletedOrderItem = await OrderItemService.deleteOrderItem(id);
            if (deletedOrderItem) {
                res.status(200).json(deletedOrderItem);
            } else {
                res.status(404).json({ error: 'Order item not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};