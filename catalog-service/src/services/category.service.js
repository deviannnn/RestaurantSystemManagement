const { Category, Item } = require('../models');

const includeOptions = [
    { model: Item, as: 'items' }
];

module.exports = {
    async createCategory(name, description, active) {
        try {
            return Category.create({ name, description, active })
            .then((newCategory) => newCategory.get({ plain: true }));
        } catch (error) {
            console.error('Error create categories:', error);
            throw error;
        }
    },

    async getCategoryById(id) {
        try {
            return await Category.findByPk(id, {
                include: includeOptions
            });
        } catch (error) {
            console.error('Error get categories by Id:', error);
            throw error;
        }
    },

    async getAllCategories(active = null) {
        try {
            const whereCondition = active !== null ? { active } : {};
            const includeCondition = active !== null ? [{ ...includeOptions[0], where: { active } }] : includeOptions;

            return await Category.findAll({
                where: whereCondition,
                include: includeCondition
            });
        } catch (error) {
            console.error('Error get all categories:', error);
            throw error;
        }
    },

    async updateCategory(id, name, description, active) {
        try {
            const [updated] = await Category.update({ name, description, active }, { where: { id } });
            if (updated) {
                return Category.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error update categories:', error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const category = await Category.findByPk(id);
            if (category) {
                await Category.destroy({ where: { id } });
                return category;
            }
            return null;
        } catch (error) {
            console.error('Error delete categories:', error);
            throw error;
        }
    }
};