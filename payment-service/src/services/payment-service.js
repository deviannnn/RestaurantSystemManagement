const { Payment, PaymentSurcharge } = require('../models');

module.exports = {
    async createPayment(userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note) {
        try {
            const newPayment = await Payment.create({ userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note });
            return newPayment;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    async getPaymentById(id) {
        try {
            return await Payment.findByPk(id, {
                include: [{ model: PaymentSurcharge, as: 'surcharges' }]
            });
        } catch (error) {
            console.error('Error getting payment by ID:', error);
            throw error;
        }
    },

    async getAllPayments() {
        try {
            const payments = await Payment.findAll({
                include: [{ model: PaymentSurcharge, as: 'surcharges' }]
            });
            return payments;
        } catch (error) {
            console.error('Error getting all payments:', error);
            throw error;
        }
    },

    async updatePayment({ id, subAmount, totalSurcharge, totalDiscount, totalAmount, note }) {
        try {
            const [updated] = await Payment.update(
                { subAmount, totalSurcharge, totalDiscount, totalAmount, note },
                { where: { id } }
            );
            if (updated) {
                return await Payment.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    },

    async deletePayment(id) {
        try {
            const payment = await Payment.findByPk(id);
            if (payment) {
                await Payment.destroy({ where: { id } });
                return payment;
            }
            return null;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    }
};