const { Op } = require('sequelize');
const { Item } = require('../models');

module.exports = {
    async createItem({ name, price, image, description, available, active, categoryId }) {
        try {
            const newItem = await Item.create({ name, price, image, description, available, active, categoryId });
            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    },

    async getItemById(id, active = null) {
        try {
            const whereCondition = active !== null ? { active } : {};
            return await Item.findByPk(id, { where: whereCondition });
        } catch (error) {
            console.error('Error getting item by ID:', error);
            throw error;
        }
    },

    async getAllItems(active = null) {
        try {
            const whereCondition = active !== null ? { active } : {};
            return await Item.findAll({ where: whereCondition });
        } catch (error) {
            console.error('Error getting all items:', error);
            throw error;
        }
    },

    async searchItemByName(nameQuery, active = null) {
        return await Item.findAll({
            where: {
                name: {
                    [Op.like]: `%${nameQuery}%`
                },
                ...(active !== null && { active })
            }
        });
    },

    async updateItem({ id, name, price, image, description, available, active, categoryId }) {
        try {
            const [updated] = await Item.update({ name, price, image, description, available, active, categoryId }, { where: { id } });
            if (updated) {
                return Item.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    },

    async deleteItem(id) {
        try {
            const item = await Item.findByPk(id);
            if (item) {
                await Item.destroy({ where: { id } });
                return item;
            }
            return null;
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    },

    async getItemsByListIds(itemIds) {
        try {
            // Lấy tất cả các mục với id trong itemIds
            const allItems = await Item.findAll({
                where: { id: itemIds },
                attributes: ['id', 'name', 'price', 'available', 'active']
            });

            const validItems = [];
            const invalidItems = [];

            // Tạo một tập hợp chứa tất cả các id của mục đã tìm thấy
            const foundItemIds = new Set(allItems.map(item => item.id));

            // Phân loại các mục hợp lệ và không hợp lệ
            allItems.forEach(item => {
                const itemData = { id: item.id, name: item.name };
                if (item.available && item.active) {
                    validItems.push({ ...itemData, price: item.price });
                } else {
                    invalidItems.push({ ...itemData, detail: 'Unavailable' });
                }
            });

            // Tìm các mục không tồn tại và thêm vào danh sách invalidItems
            itemIds.forEach(itemId => {
                if (!foundItemIds.has(itemId)) {
                    invalidItems.push({ id: itemId, name: 'Unknown', detail: 'Not Found' });
                }
            });

            return {
                validItems,
                invalidItems
            };
        } catch (error) {
            console.error('Error getting items by list Ids:', error);
            throw error;
        }
    }
};