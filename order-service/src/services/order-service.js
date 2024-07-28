const { Op, fn, literal } = require('sequelize');
const { Order, OrderItem } = require('../models');

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

    async getOrderById(id, include = true) {
        try {
            const order = await Order.findOne({
                where: { id },
                attributes: [
                    'id', 'tableId', 'userId', 'status', 'active',
                    [fn('SUM', literal('CASE WHEN orderItems.active = true THEN orderItems.quantity ELSE 0 END')), 'totalItems'],
                    [fn('ROUND', literal('SUM(CASE WHEN orderItems.active = true THEN orderItems.amount ELSE 0 END)'), 2), 'subAmount'],
                    'createdAt',
                    'updatedAt'
                ],
                include: { model: OrderItem, as: 'orderItems', attributes: [] },
                group: ['Order.id']
            });


            if (!order) {
                return null;
            }

            if (include) {
                order.dataValues.orderItems = await OrderItem.findAll({
                    where: { orderId: order.id }
                });
            }

            return order;
        } catch (error) {
            console.error('Error getting order by ID:', error);
            throw error;
        }
    },

    async getAllOrders(userId = null, status = null, fromDate = null, toDate = null) {
        try {
            const whereClause = {};

            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status;

            if (!fromDate && !toDate) {
                fromDate = new Date().setUTCHours(0, 0, 0, 0);
                toDate = new Date().setUTCHours(23, 59, 59, 999);
            } else {
                if (fromDate) fromDate = new Date(fromDate).setUTCHours(0, 0, 0, 0);
                if (toDate) toDate = new Date(toDate).setUTCHours(23, 59, 59, 999);
                if (!fromDate) fromDate = new Date('2024-01-01').setUTCHours(0, 0, 0, 0);
                if (!toDate) toDate = new Date().setUTCHours(23, 59, 59, 999);
                if (fromDate > toDate) [fromDate, toDate] = [new Date(toDate).setUTCHours(0, 0, 0, 0), new Date(fromDate).setUTCHours(23, 59, 59, 999)];
            }
            
            whereClause.createdAt = { [Op.between]: [fromDate, toDate] };

            const orders = await Order.findAll({
                where: whereClause,
                attributes: [
                    'id', 'tableId', 'userId', 'status', 'active',
                    [fn('SUM', literal('CASE WHEN orderItems.active = true THEN orderItems.quantity ELSE 0 END')), 'totalItems'],
                    [fn('ROUND', literal('SUM(CASE WHEN orderItems.active = true THEN orderItems.amount ELSE 0 END)'), 2), 'subAmount'],
                    'createdAt',
                    'updatedAt'
                ],
                include: { model: OrderItem, as: 'orderItems', attributes: [] },
                group: ['Order.id']
            });
            return orders;
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    },

    async updateOrder({ id, status, active, tableId }) {
        try {
            const [updated] = await Order.update(
                { status, active, tableId },
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