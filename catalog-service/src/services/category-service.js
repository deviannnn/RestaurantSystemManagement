const { Category, Item } = require('../models');

module.exports = {
    async createCategory({ name, description, active }) {
        try {
            const newCategory = await Category.create({ name, description, active });
            return newCategory;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    async getCategoryById(id, active = null, include = true) {
        try {
            const whereCondition = active !== null ? { active } : {};
            const includeCondition = include ? [{
                model: Item,
                as: 'items',
                where: active !== null ? { active } : {}
            }] : [];

            return await Category.findByPk(id, {
                where: whereCondition,
                include: includeCondition
            });
        } catch (error) {
            console.error('Error getting category by Id:', error);
            throw error;
        }
    },

    async getAllCategories(active = null, include = true) {
        try {
            const whereCondition = active !== null ? { active } : {};
            const includeCondition = include ? [{
                model: Item,
                as: 'items',
                where: active !== null ? { active } : {}
            }] : [];

            return await Category.findAll({
                where: whereCondition,
                include: includeCondition
            });
        } catch (error) {
            console.error('Error getting all categories:', error);
            throw error;
        }
    },

    async updateCategory({ id, name, description, active }) {
        try {
            const [updated] = await Category.update({ name, description, active }, { where: { id } });
            if (updated) {
                return Category.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating category:', error);
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
            console.error('Error deleting category:', error);
            throw error;
        }
    }
};