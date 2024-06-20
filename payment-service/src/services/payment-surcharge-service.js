const { PaymentSurcharge, Payment, Surcharge } = require('../models');

const includeOptions = [
    { model: Payment, as: 'payment' },
    { model: Surcharge, as: 'surcharge' }
];

module.exports = {
    async createPaymentSurcharge(paymentId, surchargeId, value, amount) {
        try {
            const newPaymentSurcharge = await PaymentSurcharge.create({ paymentId, surchargeId, value, amount });
            return newPaymentSurcharge.get({ plain: true });
        } catch (error) {
            console.error('Error creating payment surcharge:', error);
            throw error;
        }
    },

    async getPaymentSurchargeById(id) {
        try {
            return await PaymentSurcharge.findByPk(id, {
                include: includeOptions
            });
        } catch (error) {
            console.error('Error getting payment surcharge by ID:', error);
            throw error;
        }
    },

    async getAllPaymentSurcharges() {
        try {
            return await PaymentSurcharge.findAll();
        } catch (error) {
            console.error('Error getting all payment surcharges:', error);
            throw error;
        }
    },

    async updatePaymentSurcharge(id, paymentId, surchargeId, value, amount) {
        try {
            const [updated] = await PaymentSurcharge.update({ paymentId, surchargeId, value, amount }, { where: { id } });
            if (updated) {
                return await PaymentSurcharge.findByPk(id, {
                    include: includeOptions
                });
            }
            return null;
        } catch (error) {
            console.error('Error updating payment surcharge:', error);
            throw error;
        }
    },

    async deletePaymentSurcharge(id) {
        try {
            const paymentSurcharge = await PaymentSurcharge.findByPk(id);
            if (paymentSurcharge) {
                await PaymentSurcharge.destroy({ where: { id } });
                return paymentSurcharge;
            }
            return null;
        } catch (error) {
            console.error('Error deleting payment surcharge:', error);
            throw error;
        }
    }
};