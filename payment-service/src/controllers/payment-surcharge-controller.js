const createError = require('http-errors');

const { PaymentSurchargeService } = require('../services');

module.exports = {
    /** Expected Input
     * 
     * { paymentId, surchargeId, value, amount } = req.body
     * 
     */
    async createPaymentSurcharge(req, res, next) {
        try {
            const { paymentId, surchargeId, value, amount } = req.body;
            const newPaymentSurcharge = await PaymentSurchargeService.createPaymentSurcharge(paymentId, surchargeId, value, amount);
            res.status(201).json({
                success: true,
                message: 'Create paymentSurcharge successfully!',
                data: { paymentSurcharge: newPaymentSurcharge }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * psId ? = req.params
     * 
     */
    async getPaymentSurcharges(req, res, next) {
        try {
            const { psId } = req.params;
            if (psId) {
                const paymentSurcharge = await PaymentSurchargeService.getPaymentSurchargeById(psId);
                if (!paymentSurcharge) return next(createError(404, 'PaymentSurcharge not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get paymentSurcharge successfully!',
                    data: { paymentSurcharge }
                });
            } else {
                const paymentSurcharges = await PaymentSurchargeService.getAllPaymentSurcharges();
                res.status(200).json({
                    success: true,
                    message: 'Get all paymentSurcharges successfully!',
                    data: { paymentSurcharges }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * psId = req.params
     * { paymentId, surchargeId, value, amount } = req.body
     * 
     */
    async updatePaymentSurcharge(req, res, next) {
        try {
            const { psId } = req.params;
            const { paymentId, surchargeId, value, amount } = req.body;

            const updatedPS = await PaymentSurchargeService.updatePaymentSurcharge({ id: psId, paymentId, surchargeId, value, amount });
            if (!updatedPS) return next(createError(404, 'PaymentSurcharge not found'));

            res.status(200).json({
                sucess: true,
                message: 'Update paymentSurcharge successfully!',
                data: { paymentSurcharge: updatedPS }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * psId = req.params
     * 
     */
    async deletePaymentSurcharge(req, res, next) {
        try {
            const { psId } = req.params;

            const deletedPS = await PaymentSurchargeService.deletePaymentSurcharge(psId);
            if (!deletedPS) return next(createError(404, 'PaymentSurcharge not found'));

            res.status(200).json({
                success: true,
                message: 'Delete paymentSurcharge successfully!',
                data: { paymentSurcharge: deletedPS }
            });
        } catch (error) {
            return next(error);
        }
    }
};