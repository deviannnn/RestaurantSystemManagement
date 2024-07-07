const { Op } = require('sequelize');
const { Item } = require('../models');

class ItemService {
    static async createItem(name, price, image, description, available, active, categoryId) {
        return Item.create({ name, price, image, description, available, active, categoryId })
            .then((newItem) => newItem.get({ plain: true }));
    }

    static async getItemById(id) {
        return Item.findByPk(id);
    }

    static async getAllItems() {
        return Item.findAll();
    }

    static async searchItemByName(qName) {
        return Item.findAll({
            where: {
                name: {
                    [Op.like]: `%${qName}%`,
                },
            },
        });
    }

    static async getItemsByListIds(itemIds) {
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
                const itemData = { id: item.id, name: item.name, price: item.price };
                if (item.available && item.active) {
                    validItems.push(itemData);
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
    }

    static async updateItem({ id, name, price, image, description, available, active, categoryId }) {
        const [updated] = await Item.update({ name, price, image, description, available, active, categoryId }, { where: { id } });
        if (updated) {
            return Item.findByPk(id);
        }
        return null;
    }

    static async deleteItem(id) {
        const item = await Item.findByPk(id);
        if (item) {
            await Item.destroy({ where: { id } });
            return item;
        }
        return null;
    }
}

module.exports = ItemService;