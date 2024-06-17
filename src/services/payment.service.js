const { Payment, User, Order } = require('../models');

class PaymentService {
    static async createPayment(userId, orderId, subAmount, totalSurchage, totalDiscount, totalAmount, note) {
        return Payment.create({ userId, orderId, subAmount, totalSurchage, totalDiscount, totalAmount, note })
            .then(newPayment => newPayment.get({ plain: true }));
    }

    static async getPaymentById(id) {
        return Payment.findByPk(id, {
            include: [
                { model: User, as: 'user' },
                { model: Order, as: 'order' }
            ]
        });
    }

    static async getAllPayments() {
        return Payment.findAll({
            include: [
                { model: User, as: 'user' },
                { model: Order, as: 'order' }
            ]
        });
    }

    static async updatePayment(id, subAmount, totalSurchage, totalDiscount, totalAmount, note) {
        const [updated] = await Payment.update({ subAmount, totalSurchage, totalDiscount, totalAmount, note }, { where: { id } });
        if (updated) {
            return Payment.findByPk(id, {
                include: [
                    { model: User, as: 'user' },
                    { model: Order, as: 'order' }
                ]
            });
        }
        return null;
    }

    static async deletePayment(id) {
        const payment = await Payment.findByPk(id);
        if (payment) {
            await Payment.destroy({ where: { id } });
            return payment;
        }
        return null;
    }
}

module.exports = PaymentService;