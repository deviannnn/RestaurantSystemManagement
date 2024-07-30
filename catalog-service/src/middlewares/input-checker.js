const createError = require('http-errors');
const { body } = require('express-validator');
const validator = require('./validator');

const { CategoryService } = require('../services');

module.exports = {
    checkBodyCreateCategory: [
        body('name')
            .notEmpty().withMessage('Category\'s Name is required')
            .isString().withMessage('Category\'s Name must be a string'),
        body('description')
            .optional()
            .notEmpty().withMessage('Category\'s Description is required')
            .isString().withMessage('Category\'s Description must be a string'),
        body('active')
            .optional()
            .notEmpty().withMessage('Category\'s Active status is required')
            .isBoolean().withMessage('Category\'s Active status must be a boolean value'),
        validator,
    ],

    checkBodyUpdateCategory: [
        body('name')
            .optional()
            .notEmpty().withMessage('Category\'s Name is required')
            .isString().withMessage('Category\'s Name must be a string'),
        body('description')
            .optional()
            .notEmpty().withMessage('Category\'s Description is required')
            .isString().withMessage('Category\'s Description must be a string'),
        body('active')
            .optional()
            .notEmpty().withMessage('Category\'s Active status is required')
            .isBoolean().withMessage('Category\'s Active status must be a boolean value'),
        validator
    ],

    checkBodyCreateItem: [
        body('name')
            .notEmpty().withMessage('Item\'s Name is required')
            .isString().withMessage('Item\'s Name must be a string'),
        body('price')
            .notEmpty().withMessage('Item\'s Price is required')
            .isFloat({ min: 0 }).withMessage('Item\'s Price must be a real number >= 0'),
        body('description')
            .optional()
            .notEmpty().withMessage('Item\'s Description is required')
            .isString().withMessage('Item\'s Description must be a string'),
        body('available')
            .optional()
            .notEmpty().withMessage('Item\'s Available status is required')
            .isBoolean().withMessage('Item\'s Available status must be a boolean value'),
        body('active')
            .optional()
            .notEmpty().withMessage('Item\'s Active status is required')
            .isBoolean().withMessage('Item\'s Active status must be a boolean value'),
        validator,
    ],

    checkBodyUpdateItem: [
        body('name')
            .optional()
            .notEmpty().withMessage('Item\'s Name is required')
            .isString().withMessage('Item\'s Name must be a string'),
        body('price')
            .optional()
            .notEmpty().withMessage('Item\'s Price is required')
            .isFloat({ min: 0 }).withMessage('Item\'s Price must be a real number >= 0'),
        body('description')
            .optional()
            .notEmpty().withMessage('Item\'s Description is required')
            .isString().withMessage('Item\'s Description must be a string'),
        body('available')
            .optional()
            .notEmpty().withMessage('Item\'s Available status is required')
            .isBoolean().withMessage('Item\'s Available status must be a boolean value'),
        body('active')
            .optional()
            .notEmpty().withMessage('Item\'s Active status is required')
            .isBoolean().withMessage('Item\'s Active status must be a boolean value'),
        validator
    ],

    checkBodyCaterogy: [
        body('categoryId').notEmpty().withMessage('Category ID is required'),
        validator
    ],

    checkCaterogyExist: async (req, res, next) => {
        const categoryId = req.body.categoryId;

        if (!categoryId) {
            return next();
        }

        try {
            const categoryData = await CategoryService.getCategoryById(categoryId, null, false);
            if (!categoryData) return next(createError(404, 'Category not found'));

            req.category = categoryData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    checkItemIds: [
        body('itemIds').isArray({ min: 1 }).withMessage('ItemIds must be a non-empty array'),
        validator
    ],
};