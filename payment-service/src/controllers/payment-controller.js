const axios = require('axios');
const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const PaymentService = require('../services/payment-service');
const PaymentSurchargeService = require('../services/payment-surcharge-service');
const SurchargeService = require('../services/surcharge-service');

function calculateSurchargeAmounts(surcharges, subAmount) {
    const { totalSurcharge, paymentSurcharges } = surcharges.reduce((acc, { id, isPercent, value }) => {
        const surchargeValue = isPercent ? (value / 100) : value;
        const amount = isPercent ? (subAmount * surchargeValue) : surchargeValue;
        acc.totalSurcharge += amount;
        acc.paymentSurcharges.push({
            surchargeId: id,
            value: surchargeValue,
            amount
        });
        return acc;
    }, { totalSurcharge: 0, paymentSurcharges: [] });

    return { totalSurcharge, paymentSurcharges };
}

module.exports = {
    /** Expected Input
    * 
    * { userId, orderId, surchargeIds, totalDiscount, note } = req.body;
    * surchargeIds list of surcharge_id
    * 
    */
    createPayment: [
        inputChecker.checkBodyOrder,
        inputChecker.checkOrderExist,
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyCreatePayment,
        async (req, res, next) => {
            try {
                const { userId, orderId, totalDiscount = 0, note } = req.body;
                const subAmount = req.order.subAmount;
                const surcharges = req.surcharges;

                const { totalSurcharge, paymentSurcharges } = calculateSurchargeAmounts(surcharges, subAmount);

                const totalAmount = subAmount + totalSurcharge - totalDiscount;

                const payment = await PaymentService.createPayment(userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note);

                const paymentSurchargePromises = paymentSurcharges.map(ps =>
                    PaymentSurchargeService.createPaymentSurcharge(payment.id, ps.surchargeId, ps.value, ps.amount)
                );
                await Promise.all(paymentSurchargePromises);

                res.status(201).json({ success: true, message: 'Payment created successfully', data: { payment, paymentSurcharges } });
            } catch (error) {
                next(error);
            }
        }
    ],

    async getPayments(req, res, next) {
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

    async updatePayment(req, res, next) {
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

    async deletePayment(req, res, next) {
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