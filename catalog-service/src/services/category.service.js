const { Category, Item } = require('../models');

const includeOptions = [
    { model: Item, as: 'items' }
];

class CategoryService {
    static async createCategory(name, description, active) {
        return Category.create({ name, description, active })
            .then((newCategory) => newCategory.get({ plain: true }));
    }

    static async getCategoryById(id) {
        return await Category.findByPk(id, {
            include: includeOptions
        });
    }

    static async getAllCategories(active = null) {
        const whereCondition = active !== null ? { active } : {};
        const includeCondition = active !== null ? [{ ...includeOptions[0], where: { active } }] : includeOptions;

        return await Category.findAll({
            where: whereCondition,
            include: includeCondition
        });
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