const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const { CategoryService, RedisService } = require('../services');

const REDIS_KEY_CATALOG_FULL = 'CATALOG_FULL';
const REDIS_KEY_CATALOG_CATEGORY = 'CATALOG_FULL_CATEGORY';
const CACHE_EXPIRATION = 10;

module.exports = {
    /** Expected Input
     * 
     * { name, description, active } = req.body
     * 
     */
    createCategory: [
        inputChecker.checkBodyCreateCategory,
        async (req, res, next) => {
            try {
                const { name, description, active } = req.body;

                const newCategory = await CategoryService.createCategory({ name, description, active });
                res.status(201).json({
                    success: true,
                    message: 'Create categories sucessfully!',
                    data: { category: newCategory }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * categoryId ? = req.params
     * include ? = req.query
     * 
     */
    async getCategories(req, res, next) {
        try {
            const { categoryId } = req.params;
            const include = req.query.include === 'false' || req.query.include === '0' ? false : true;

            if (categoryId) {
                const category = await CategoryService.getCategoryById(categoryId, null, include);
                if (!category) return next(createError(404, 'Category not found'));
                res.status(200).json({
                    sucess: true,
                    message: 'Get category successfully!',
                    data: { category }
                });
            } else {
                const categories = await CategoryService.getAllCategories(null, include);
                res.status(200).json({
                    sucess: true,
                    message: 'Get all categories successfully!',
                    data: { categories }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { name, description, active } = req.body
     * 
     */
    updateCategory: [
        inputChecker.checkBodyUpdateCategory,
        async (req, res, next) => {
            try {
                const { categoryId } = req.params;
                const { name, description, active } = req.body;

                const updatedCategory = await CategoryService.updateCategory({ id: categoryId, name, description, active });
                if (!updatedCategory) return next(createError(404, 'Category not found'));

                res.status(200).json({
                    sucess: true,
                    message: 'Update category successfully!',
                    data: { category: updatedCategory }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * categoryId = req.params
     * 
     */
    async deleteCategory(req, res, next) {
        try {
            const { categoryId } = req.params;

            const deletedCategory = await CategoryService.deleteCategory(categoryId);
            if (!deletedCategory) return next(createError(404, 'Category not found'));

            res.status(200).json({
                success: true,
                message: 'Delete category successfully!',
                data: { category: deletedCategory }
            });
        } catch (error) {
            return next(error);
        }
    },

    async getFullCatalog(req, res, next) {
        try {
            // Kiểm tra cache trong Redis
            let catalog = await RedisService.getCacheData(REDIS_KEY_CATALOG_FULL);

            if (!catalog) {
                catalog = await CategoryService.getAllCategories(true, true);
                if (!catalog || catalog.length === 0) return next(createError(404, 'No items found in the catalog'));

                await RedisService.saveCacheData({
                    key: REDIS_KEY_CATALOG_FULL,
                    value: catalog,
                    expireTimeInSeconds: CACHE_EXPIRATION
                });
            }

            res.status(200).json({
                success: true,
                message: 'Get full catalog successfully!',
                data: { catalog }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * categoryId = req.params
     * 
     */
    async getFullCatalogByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const REDIS_KEY = `${REDIS_KEY_CATALOG_CATEGORY}:${categoryId}`;

            // Kiểm tra cache trong Redis
            let catalog = await RedisService.getCacheData(REDIS_KEY);

            if (!catalog) {
                catalog = await CategoryService.getCategoryById(categoryId, true, true);
                if (!catalog || catalog.length === 0) return next(createError(404, 'No items found in the catalog with this category'));

                await RedisService.saveCacheData({
                    key: REDIS_KEY,
                    value: catalog,
                    expireTimeInSeconds: CACHE_EXPIRATION
                });
            }

            res.status(200).json({
                success: true,
                message: 'Get full catalog by category successfully!',
                data: { catalog }
            });
        } catch (error) {
            return next(error);
        }
    },
};