const { OrderItem, Order } = require('../models');

const includeOptions = [
    { model: Order, as: 'order' }
];

module.exports = {
    async createOrderItem(orderId, itemId, quantity, price, amount) {
        try {
            const newOrderItem = await OrderItem.create({ orderId, itemId, quantity, price, amount });
            return newOrderItem.get({ plain: true });
        } catch (error) {
            console.error('Error creating order item:', error);
            throw error;
        }
    },

    async bulkCreateOrderItems(orderItems) {
        try {
            const createdOrderItems = await OrderItem.bulkCreate(orderItems);
            return createdOrderItems;
        } catch (error) {
            console.error('Error creating order items:', error);
            throw error;
        }
    },

    async getOrderItemById(id) {
        try {
            return await OrderItem.findByPk(id, {
                include: includeOptions
            });
        } catch (error) {
            console.error('Error getting order item by ID:', error);
            throw error;
        }
    },

    async getAllOrderItems() {
        try {
            return await OrderItem.findAll();
        } catch (error) {
            console.error('Error getting all order items:', error);
            throw error;
        }
    },

    async getByOrderIdAndItemId(orderId, itemId) {
        try {
            const orderItem = await OrderItem.findOne({
                where: {
                    orderId,
                    itemId
                }
            });
            return orderItem;
        } catch (error) {
            console.error('Error getting order item by orderId and itemId:', error);
            throw error;
        }
    },

    async updateOrderItem({ id, orderId, itemId, quantity, price, amount, status, active }) {
        try {
            const [updated] = await OrderItem.update(
                { orderId, itemId, quantity, price, amount, status, active },
                { where: { id } }
            );
            if (updated) {
                return await OrderItem.findByPk(id, {
                    include: includeOptions
                });
            }
            return null;
        } catch (error) {
            console.error('Error updating order item:', error);
            throw error;
        }
    },

    async deleteOrderItem(id) {
        try {
            const orderItem = await OrderItem.findByPk(id);
            if (orderItem) {
                await OrderItem.destroy({ where: { id } });
                return orderItem;
            }
            return null;
        } catch (error) {
            console.error('Error deleting order item:', error);
            throw error;
        }
    }
};