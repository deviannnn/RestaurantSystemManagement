const PaymentService = require('../services/payment-service');

module.exports = {
    async createPayment(req, res) {
        try {
            const { userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note } = req.body;
            const newPayment = await PaymentService.createPayment(userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note);
            res.status(201).json(newPayment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getPayments(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const payment = await PaymentService.getPaymentById(id);
                if (payment) {
                    res.status(200).json(payment);
                } else {
                    res.status(404).json({ error: 'Payment not found' });
                }
            } else {
                const payments = await PaymentService.getAllPayments();
                res.status(200).json(payments);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updatePayment(req, res) {
        try {
            const { id } = req.params;
            const { subAmount, totalSurcharge, totalDiscount, totalAmount, note } = req.body;
            const updatedPayment = await PaymentService.updatePayment(id, subAmount, totalSurcharge, totalDiscount, totalAmount, note);
            if (updatedPayment) {
                res.status(200).json(updatedPayment);
            } else {
                res.status(404).json({ error: 'Payment not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deletePayment(req, res) {
        try {
            const { id } = req.params;
            const deletedPayment = await PaymentService.deletePayment(id);
            if (deletedPayment) {
                res.status(200).json(deletedPayment);
            } else {
                res.status(404).json({ error: 'Payment not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};