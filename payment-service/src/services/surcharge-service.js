const { Surcharge } = require('../models');

module.exports = {
    async createSurcharge(name, isPercent, value, description, active) {
        try {
            const newSurcharge = await Surcharge.create({ name, isPercent, value, description, active });
            return newSurcharge.get({ plain: true });
        } catch (error) {
            console.error('Error creating surcharge:', error);
            throw error;
        }
    },

    async getSurchargeById(id) {
        try {
            return await Surcharge.findByPk(id);
        } catch (error) {
            console.error('Error getting surcharge by ID:', error);
            throw error;
        }
    },

    async getAllSurcharges() {
        try {
            return await Surcharge.findAll();
        } catch (error) {
            console.error('Error getting all surcharges:', error);
            throw error;
        }
    },

    async updateSurcharge(id, name, isPercent, value, description, active) {
        try {
            const [updated] = await Surcharge.update(
                { name, isPercent, value, description, active },
                { where: { id } }
            );
            if (updated) {
                return await Surcharge.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating surcharge:', error);
            throw error;
        }
    },

    async deleteSurcharge(id) {
        try {
            const surcharge = await Surcharge.findByPk(id);
            if (surcharge) {
                await Surcharge.destroy({ where: { id } });
                return surcharge;
            }
            return null;
        } catch (error) {
            console.error('Error deleting surcharge:', error);
            throw error;
        }
    }
};