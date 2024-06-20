const { Category } = require('../models');

class CategoryService {
    static async createCategory(name, description, active) {
        return Category.create({ name, description, active })
            .then((newCategory) => newCategory.get({ plain: true }));
    }

    static async getCategoryById(id) {
        return Category.findByPk(id);
    }

    static async getAllCategories() {
        return Category.findAll();
    }

    static async updateCategory(id, name, description, active) {
        const [updated] = await Category.update({ name, description, active }, { where: { id } });
        if (updated) {
            return Category.findByPk(id);
        }
        return null;
    }

    static async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (category) {
            await Category.destroy({ where: { id } });
            return category;
        }
        return null;
    }
}

module.exports = CategoryService;