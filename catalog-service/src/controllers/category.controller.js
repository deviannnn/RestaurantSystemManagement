const CategoryService = require('../services/category.service');
const connectRedis = require('../config/redis');

class CategoryController {
    // Create a new category
    static async createCategory(req, res) {
        try {
            const { name, description, active } = req.body;
            const newCategory = await CategoryService.createCategory(name, description, active);
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all categories or get category by ID
    static async getCategories(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const category = await CategoryService.getCategoryById(id);
                if (category) {
                    res.status(200).json(category);
                } else {
                    res.status(404).json({ error: 'Category not found' });
                }
            } else {

                const categories = await CategoryService.getAllCategories();
                res.status(200).json(categories);

            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update category by ID
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description, active } = req.body;
            const updatedCategory = await CategoryService.updateCategory(id, name, description, active);
            if (updatedCategory) {
                res.status(200).json(updatedCategory);
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete category by ID
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const deletedCategory = await CategoryService.deleteCategory(id);
            if (deletedCategory) {
                res.status(200).json(deletedCategory);
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CategoryController;