const createError = require('http-errors');

const { SurchargeService } = require('../services');

module.exports = {
    /** Expected Input
     * 
     * { name, isPercent, value, description, active } = req.body
     * 
     */
    async createSurcharge(req, res) {
        try {
            const { name, isPercent, value, description, active } = req.body;
            const newSurcharge = await SurchargeService.createSurcharge(name, isPercent, value, description, active);
            res.status(201).json({
                success: true,
                message: 'Create surcharge successfully!',
                data: { surcharge: newSurcharge }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * surchargeId ? = req.params
     * 
     */
    async getSurcharges(req, res, next) {
        try {
            const { surchargeId } = req.params;
            if (surchargeId) {
                const surcharge = await SurchargeService.getSurchargeById(surchargeId);
                if (!surcharge) return next(createError(404, 'Surcharge not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get surcharge successfully!',
                    data: { surcharge }
                });
            } else {
                const surcharges = await SurchargeService.getAllSurcharges();
                res.status(200).json({
                    success: true,
                    message: 'Get all surcharges successfully!',
                    data: { surcharges }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * surchargeId = req.params
     * { name, isPercent, value, description, active } = req.body
     * 
     */
    async updateSurcharge(req, res) {
        try {
            const { surchargeId } = req.params;
            const { name, isPercent, value, description, active } = req.body;

            const updatedSurcharge = await SurchargeService.updateSurcharge({ id: surchargeId, name, isPercent, value, description, active });
            if (!updatedSurcharge) return next(createError(404, 'Surcharge not found'));

            res.status(200).json({
                sucess: true,
                message: 'Update surcharge successfully!',
                data: { surcharge: updatedSurcharge }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * surchargeId = req.params
     * 
     */
    async deleteSurcharge(req, res) {
        try {
            const { surchargeId } = req.params;

            const deletedSurcharge = await SurchargeService.deleteSurcharge(surchargeId);
            if (!deletedSurcharge) return next(createError(404, 'Surcharge not found'));

            res.status(200).json({
                success: true,
                message: 'Delete surcharge successfully!',
                data: { surcharge: deletedSurcharge }
            });
        } catch (error) {
            return next(error);
        }
    }
};