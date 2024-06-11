const PaymentService = require('../services/payment.service');

class PaymentController {
    // Create a new payment
    static async createPayment(req, res) {
        try {
            const { userId, orderId, subAmount, totalSurchage, totalDiscount, totalAmount, note } = req.body;
            const newPayment = await PaymentService.createPayment(userId, orderId, subAmount, totalSurchage, totalDiscount, totalAmount, note);
            res.status(201).json(newPayment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all payments or get payment by ID
    static async getPayments(req, res) {
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
    }

    // Update payment by ID
    static async updatePayment(req, res) {
        try {
            const { id } = req.params;
            const { subAmount, totalSurchage, totalDiscount, totalAmount, note } = req.body;
            const updatedPayment = await PaymentService.updatePayment(id, subAmount, totalSurchage, totalDiscount, totalAmount, note);
            if (updatedPayment) {
                res.status(200).json(updatedPayment);
            } else {
                res.status(404).json({ error: 'Payment not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete payment by ID
    static async deletePayment(req, res) {
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
}

module.exports = PaymentController;