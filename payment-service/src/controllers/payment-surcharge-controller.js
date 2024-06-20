const PaymentSurchargeService = require('../services/payment-surcharge-service');

module.exports = {
    async createPaymentSurcharge(req, res) {
        try {
            const { paymentId, surchargeId, value, amount } = req.body;
            const newPaymentSurcharge = await PaymentSurchargeService.createPaymentSurcharge(paymentId, surchargeId, value, amount);
            res.status(201).json(newPaymentSurcharge);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getPaymentSurchargeById(req, res) {
        try {
            const { id } = req.params;
            const paymentSurcharge = await PaymentSurchargeService.getPaymentSurchargeById(id);
            if (paymentSurcharge) {
                res.status(200).json(paymentSurcharge);
            } else {
                res.status(404).json({ error: 'Payment surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllPaymentSurcharges(req, res) {
        try {
            const paymentSurcharges = await PaymentSurchargeService.getAllPaymentSurcharges();
            res.status(200).json(paymentSurcharges);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updatePaymentSurcharge(req, res) {
        try {
            const { id } = req.params;
            const { paymentId, surchargeId, value, amount } = req.body;
            const updatedPaymentSurcharge = await PaymentSurchargeService.updatePaymentSurcharge(id, paymentId, surchargeId, value, amount);
            if (updatedPaymentSurcharge) {
                res.status(200).json(updatedPaymentSurcharge);
            } else {
                res.status(404).json({ error: 'Payment surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deletePaymentSurcharge(req, res) {
        try {
            const { id } = req.params;
            const deletedPaymentSurcharge = await PaymentSurchargeService.deletePaymentSurcharge(id);
            if (deletedPaymentSurcharge) {
                res.status(200).json(deletedPaymentSurcharge);
            } else {
                res.status(404).json({ error: 'Payment surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};