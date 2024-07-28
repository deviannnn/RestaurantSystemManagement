const axios = require('axios');
const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const OrderServiceTarget = `${process.env.ORDER_SERVICE_PROTOCAL}://${process.env.ORDER_SERVICE_HOSTNAME}:${process.env.ORDER_SERVICE_PORT}`;
const { PaymentService, PaymentSurchargeService, RabbitMQService } = require('../services');

function calculateSurchargeAmounts(surcharges, subAmount) {
    const { totalSurcharge, paymentSurcharges } = surcharges.reduce((acc, { id, name, isPercent, value }) => {
        const surchargeValue = isPercent ? (value / 100) : value;
        const amount = isPercent ? (subAmount * surchargeValue) : surchargeValue;
        acc.totalSurcharge += amount;
        acc.paymentSurcharges.push({
            surchargeId: id,
            name,
            value: surchargeValue,
            amount
        });
        return acc;
    }, { totalSurcharge: 0, paymentSurcharges: [] });

    return { totalSurcharge: parseFloat(totalSurcharge.toFixed(2)), paymentSurcharges };
}

module.exports = {
    /** Expected Input
    * 
    * { orderId, surchargeIds, totalDiscount, note } = req.body;
    * (surchargeIds is list of surcharge_id)
    * 
    */
    createPayment: [
        inputChecker.checkBodyOrder,
        inputChecker.checkOrderExist,
        inputChecker.checkOrderInProgress,
        inputChecker.checkBodyCreatePayment,
        inputChecker.checkBodySurchargeIds,
        async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { tableId, id: orderId, subAmount } = req.order;
                const { totalDiscount = 0, note } = req.body;
                const { totalSurcharge, paymentSurcharges } = calculateSurchargeAmounts(req.surcharges, subAmount);

                const totalAmount = parseFloat((subAmount + totalSurcharge - totalDiscount).toFixed(2));

                const newPayment = await PaymentService.createPayment(userId, orderId, subAmount, totalSurcharge, totalDiscount, totalAmount, note);

                await Promise.all(paymentSurcharges.map(ps =>
                    PaymentSurchargeService.createPaymentSurcharge(newPayment.id, ps.surchargeId, ps.value, ps.amount)
                ));

                /// Fanout Exchange
                await RabbitMQService.publishOnPaymentCreated({ tableId, orderId }).catch(err => {
                    console.error('Error publishing On Payment Created:', err);
                });

                res.status(201).json({
                    success: true,
                    message: 'Create payment successfully!',
                    data: { payment: newPayment }
                });
            } catch (error) {
                next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * paymentId = req.params
     * 
     */
    async getPayment(req, res, next) {
        try {
            const { paymentId } = req.params;

            const payment = await PaymentService.getPaymentById(paymentId);
            if (!payment) return next(createError(404, 'Payment not found'));

            const orderResponse = await axios.get(`${OrderServiceTarget}/orders/${payment.orderId}`, {
                headers: { Authorization: req.headers.authorization }
            });

            res.status(200).json({
                success: true,
                message: 'Get payment successfully!',
                data: { payment: { ...payment.toJSON(), order: orderResponse.data.data.order } }
            });
        } catch (error) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { userId, fromDate, toDate } = req.query
     * 
     */
    getAllPayments: [
        inputChecker.checkQueryGetAllPayments,
        async (req, res, next) => {
            try {
                let { userId, fromDate, toDate } = req.query;

                const payments = await PaymentService.getAllPayments(userId, fromDate, toDate);
                const totals = payments.reduce((acc, payment) => {
                    acc.subAmount += payment.subAmount;
                    acc.totalSurcharge += payment.totalSurcharge;
                    acc.totalAmount += payment.totalAmount;
                    return acc;
                }, { subAmount: 0, totalSurcharge: 0, totalAmount: 0 });

                res.status(200).json({
                    success: true,
                    message: 'Get all payments successfully!',
                    data: {
                        userId: userId ? userId : "All User",
                        fromDate: fromDate ? fromDate : "Today",
                        toDate: toDate ? toDate : "Today",
                        payments,
                        totals
                    }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * paymentId = req.params
     * { subAmount, totalSurcharge, totalDiscount, totalAmount, note } = req.body
     * 
     */
    async updatePayment(req, res, next) {
        try {
            const { paymentId } = req.params;
            const { subAmount, totalSurcharge, totalDiscount, totalAmount, note } = req.body;

            const updatedPayment = await PaymentService.updatePayment({ id: paymentId, subAmount, totalSurcharge, totalDiscount, totalAmount, note });
            if (!updatedPayment) return next(createError(404, 'Payment not found'));

            res.status(200).json({
                sucess: true,
                message: 'Update payment successfully!',
                data: { payment: updatedPayment }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * paymentId = req.params
     * 
     */
    async deletePayment(req, res, next) {
        try {
            const { paymentId } = req.params;

            const deletedPayment = await PaymentService.deletePayment(paymentId);
            if (!deletedPayment) return next(createError(404, 'Payment not found'));

            res.status(200).json({
                success: true,
                message: 'Delete payment successfully!',
                data: { payment: deletedPayment }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
    * 
    * { paymentId } = req.params;
    * { surchargeIds } = req.body;
    * (surchargeIds is list of surcharge_id)
    * 
    */
    updateSurchargeInPayment: [
        inputChecker.checkBodySurchargeIds,
        async (req, res, next) => {
            try {
                const { paymentId } = req.params;

                const payment = await PaymentService.getPaymentById(paymentId);
                if (!payment) return next(createError(404, 'Payment not found'));

                const { subAmount, totalDiscount, surcharges: currentPaymentSurcharges } = payment.toJSON();
                const surcharges = req.surcharges;

                const { totalSurcharge, paymentSurcharges } = calculateSurchargeAmounts(surcharges, subAmount);
                const totalAmount = subAmount + totalSurcharge - totalDiscount;

                const currentSurchargeMap = new Map(currentPaymentSurcharges.map(ps => [ps.surchargeId, ps]));
                const newSurchargeMap = new Map(paymentSurcharges.map(ps => [ps.surchargeId, ps]));

                const promises = [];

                // Create or update payment surcharges
                for (const ps of paymentSurcharges) {
                    if (currentSurchargeMap.has(ps.surchargeId)) {
                        const existingPs = currentSurchargeMap.get(ps.surchargeId);
                        if (existingPs.value !== ps.value || existingPs.amount !== ps.amount) {
                            promises.push(PaymentSurchargeService.updatePaymentSurcharge(existingPs.id, ps.value, ps.amount));
                        }
                    } else {
                        promises.push(PaymentSurchargeService.createPaymentSurcharge(payment.id, ps.surchargeId, ps.value, ps.amount));
                    }
                }

                // Delete payment surcharges that are no longer present
                for (const ps of currentPaymentSurcharges) {
                    if (!newSurchargeMap.has(ps.surchargeId)) {
                        promises.push(PaymentSurchargeService.deletePaymentSurcharge(ps.id));
                    }
                }

                await Promise.all(promises);

                const updatedPayment = await PaymentService.updatePayment({ id: paymentId, subAmount, totalSurcharge, totalDiscount, totalAmount });

                res.status(200).json({
                    success: true,
                    message: 'Update surcharge in payment successfully!',
                    data: { payment: updatedPayment }
                });
            } catch (error) {
                return next(error);
            }
        }
    ]
};