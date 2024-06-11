const { Order, Table, User } = require('../models');

class OrderService {
    static async createOrder(tableId, userId) {
        return Order.create({ tableId, userId })
            .then(newOrder => newOrder.get({ plain: true }));
    }

    static async getOrderById(id) {
        return Order.findByPk(id, {
            include: [
                { model: Table, as: 'table' },
                { model: User, as: 'user' }
            ]
        });
    }

    static async getAllOrders() {
        return Order.findAll({
            include: [
                { model: Table, as: 'table' },
                { model: User, as: 'user' }
            ]
        });
    }

    static async updateOrder(id, totalQuantity, totalAmount, tableId) {
        const [updated] = await Order.update({ totalQuantity, totalAmount, tableId }, { where: { id } });
        if (updated) {
            return Order.findByPk(id, {
                include: [
                    { model: Table, as: 'table' },
                    { model: User, as: 'user' }
                ]
            });
        }
        return null;
    }

    static async deleteOrder(id) {
        const order = await Order.findByPk(id);
        if (order) {
            await Order.destroy({ where: { id } });
            return order.get({ plain: true });
        }
        return null;
    }
}

module.exports = OrderService;