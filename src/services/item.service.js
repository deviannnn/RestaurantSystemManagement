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

    static async updateItem(id, name, price, image, description, available, active, categoryId) {
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
            return item.get({ plain: true });
        }
        return null;
    }
}

module.exports = ItemService;