const { Op, fn, literal } = require('sequelize');
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

    async getAllPayments(userId = null, fromDate = null, toDate = null) {
        try {
            const whereClause = {};

            if (userId) whereClause.userId = userId;

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

            const payments = await Payment.findAll({
                where: whereClause
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