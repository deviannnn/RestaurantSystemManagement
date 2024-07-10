const { Op } = require('sequelize');
const { Item } = require('../models');

module.exports = {
    async createItem(name, price, image, description, available, active, categoryId) {
        try {
            return Item.create({ name, price, image, description, available, active, categoryId })
                .then((newItem) => newItem.get({ plain: true }));
        } catch (error) {
            console.error('Error create item:', error);
            throw error;
        }
    },

    async getItemById(id) {
        try {
            return Item.findByPk(id);
        } catch (error) {
            console.error('Error get item by ID:', error);
            throw error;
        }
    },

    async getAllItems() {
        try {
            return Item.findAll();
        } catch (error) {
            console.error('Error get all items:', error);
            throw error;
        }
    },

    async searchItemByName(qName) {
        try {
            return Item.findAll({
                where: {
                    name: {
                        [Op.like]: `%${qName}%`,
                    },
                },
            });
        } catch (error) {
            console.error('Error search item by name:', error);
            throw error;
        }
    },

    async getItemsByListIds(itemIds) {
        try {
            // Lấy tất cả các mục với id trong itemIds
            const allItems = await Item.findAll({
                where: {
                    id: itemIds
                },
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
            throw new Error(`Error fetching items: ${error.message}`);
        }
    },

    async updateItem({ id, name, price, image, description, available, active, categoryId }) {
        try {
            const [updated] = await Item.update({ name, price, image, description, available, active, categoryId }, { where: { id } });
            if (updated) {
                return Item.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error update item:', error);
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
            console.error('Error delete item:', error);
            throw error;
        }
    }
};