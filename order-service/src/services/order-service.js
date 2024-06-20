const { Order, OrderItem } = require('../models');

const includeOptions = [
    { model: OrderItem, as: 'item' }
];

module.exports = {
    async createOrder(tableId, userId) {
        try {
            const newOrder = await Order.create({ tableId, userId });
            return newOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getOrderById(id) {
        try {
            return await Order.findByPk(id, {
                include: includeOptions
            });
        } catch (error) {
            console.error('Error getting order by ID:', error);
            throw error;
        }
    },

    async getAllOrders() {
        try {
            return await Order.findAll({
                include: includeOptions
            });
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    },

    async updateOrder(id, totalQuantity, subAmount, status, tableId) {
        try {
            const [updated] = await Order.update(
                { totalQuantity, subAmount, status, tableId },
                { where: { id } }
            );
            if (updated) {
                return await Order.findByPk(id, {
                    include: includeOptions
                });
            }
            return null;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    async deleteOrder(id) {
        try {
            const order = await Order.findByPk(id);
            if (order) {
                await Order.destroy({ where: { id } });
                return order;
            }
            return null;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
};