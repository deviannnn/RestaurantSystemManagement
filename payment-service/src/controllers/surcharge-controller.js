const SurchargeService = require('../services/surcharge-service');

module.exports = {
    async createSurcharge(req, res) {
        try {
            const { name, isPercent, value, description, active } = req.body;
            const newSurcharge = await SurchargeService.createSurcharge(name, isPercent, value, description, active);
            res.status(201).json(newSurcharge);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSurchargeById(req, res) {
        try {
            const { id } = req.params;
            const surcharge = await SurchargeService.getSurchargeById(id);
            if (surcharge) {
                res.status(200).json(surcharge);
            } else {
                res.status(404).json({ error: 'Surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllSurcharges(req, res) {
        try {
            const surcharges = await SurchargeService.getAllSurcharges();
            res.status(200).json(surcharges);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateSurcharge(req, res) {
        try {
            const { id } = req.params;
            const { name, isPercent, value, description, active } = req.body;
            const updatedSurcharge = await SurchargeService.updateSurcharge(id, name, isPercent, value, description, active);
            if (updatedSurcharge) {
                res.status(200).json(updatedSurcharge);
            } else {
                res.status(404).json({ error: 'Surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteSurcharge(req, res) {
        try {
            const { id } = req.params;
            const deletedSurcharge = await SurchargeService.deleteSurcharge(id);
            if (deletedSurcharge) {
                res.status(200).json(deletedSurcharge);
            } else {
                res.status(404).json({ error: 'Surcharge not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};