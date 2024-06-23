const { Op } = require('sequelize');
const { Order, OrderItem } = require('../models');

const includeOptions = [
    { model: OrderItem, as: 'items' }
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

    async getOrdersByUser(userId, status, fromDate, toDate) {
        try {
            const whereClause = {};
            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status;
            if (fromDate && toDate) {
                const startDate = new Date(fromDate);
                startDate.setUTCHours(0, 0, 0, 0);
                const endDate = new Date(toDate);
                endDate.setUTCHours(23, 59, 59, 999);
                whereClause.createdAt = { [Op.between]: [startDate, endDate] };
            } else if (fromDate) {
                const startDate = new Date(fromDate);
                startDate.setUTCHours(0, 0, 0, 0);
                whereClause.createdAt = { [Op.gte]: startDate };
            } else if (toDate) {
                const endDate = new Date(toDate);
                endDate.setUTCHours(23, 59, 59, 999);
                whereClause.createdAt = { [Op.lte]: endDate };
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: includeOptions
            });
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    async updateOrder({ id, totalQuantity, subAmount, status, tableId }) {
        try {
            const [updated] = await Order.update(
                { totalQuantity, subAmount, status, tableId },
                { where: { id } }
            );
            if (updated) {
                return await Order.findByPk(id);
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