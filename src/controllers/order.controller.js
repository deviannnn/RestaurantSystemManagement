const OrderService = require('../services/order.service');

class OrderController {
    // Create a new order
    static async createOrder(req, res) {
        try {
            const { tableId, userId } = req.body;
            const newOrder = await OrderService.createOrder(tableId, userId);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all orders or get order by ID
    static async getOrders(req, res) {
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
    }

    // Update order by ID
    static async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const { totalQuantity, totalAmount, tableId } = req.body;
            const updatedOrder = await OrderService.updateOrder(id, totalQuantity, totalAmount, tableId);
            if (updatedOrder) {
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ error: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete order by ID
    static async deleteOrder(req, res) {
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
}

module.exports = OrderController;