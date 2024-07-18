const { Surcharge } = require('../models');

module.exports = {
    async createSurcharge(name, isPercent, value, description, active) {
        try {
            const newSurcharge = await Surcharge.create({ name, isPercent, value, description, active });
            return newSurcharge;
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

    async updateSurcharge({ id, name, isPercent, value, description, active }) {
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
    },

    async getSurchargesByListIds(surchargeIds) {
        try {
            // Lấy tất cả các mục với id trong surchargeIds
            const allSurcharges = await Surcharge.findAll({
                where: { id: surchargeIds },
                attributes: ['id', 'name', 'isPercent', 'value', 'active']
            });

            const validSurcharges = [];
            const invalidSurcharges = [];

            // Tạo một tập hợp chứa tất cả các id của mục đã tìm thấy
            const foundSurchargeIds = new Set(allSurcharges.map(surcharge => surcharge.id));

            // Phân loại các mục hợp lệ và không hợp lệ
            allSurcharges.forEach(surcharge => {
                const surchargeData = { id: surcharge.id, name: surcharge.name };
                if (surcharge.active) {
                    validSurcharges.push({ ...surchargeData, isPercent: surcharge.isPercent, value: surcharge.value });
                } else {
                    invalidSurcharges.push({ ...surchargeData, detail: 'Unavailable' });
                }
            });

            // Tìm các mục không tồn tại và thêm vào danh sách invalidSurcharges
            surchargeIds.forEach(surchargeId => {
                if (!foundSurchargeIds.has(surchargeId)) {
                    invalidSurcharges.push({ id: surchargeId, name: 'Unknown', detail: 'Not Found' });
                }
            });

            return {
                validSurcharges,
                invalidSurcharges
            };
        } catch (error) {
            console.error('Error getting surcharges by list Ids:', error);
            throw error;
        }
    },
};