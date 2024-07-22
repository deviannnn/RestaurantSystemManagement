const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

const { ItemService, CategoryService } = require('../services');

module.exports = {
    checkBodyCreateCategory: [
        check('name').notEmpty().isString().withMessage('Category Name must be a string'),
        check('description').optional().notEmpty().isString().withMessage('Category Description must be a string'),
        check('active').optional().notEmpty().isBoolean().withMessage('Category Active status must be a boolean'),
        validator,
    ],

    checkBodyUpdateCategory: [
        check('name').optional().notEmpty().isString().withMessage('Category Name must be a string'),
        check('description').optional().notEmpty().isString().withMessage('Category Description must be a string'),
        check('active').optional().notEmpty().isBoolean().withMessage('Category Active status must be a boolean'),
        validator
    ],

    checkBodyCreateItem: [
        check('name').notEmpty().isString().withMessage('Item Name must be a string'),
        check('price').notEmpty().isFloat({ min: 0 }).withMessage('Item Price must be a real number > 0'),
        check('description').optional().notEmpty().isString().withMessage('Item Description must be a string'),
        check('available').optional().notEmpty().isBoolean().withMessage('Item Available status must be a boolean'),
        check('active').optional().notEmpty().isBoolean().withMessage('Item Active status must be a boolean'),
        validator,
    ],

    checkBodyUpdateItem: [
        check('name').optional().notEmpty().isString().withMessage('Item Name must be a string'),
        check('price').optional().notEmpty().isFloat({ min: 0 }).withMessage('Item Price must be a real number > 0'),
        check('description').optional().notEmpty().isString().withMessage('Item Description must be a string'),
        check('available').optional().notEmpty().isBoolean().withMessage('Item Available status must be a boolean'),
        check('active').optional().notEmpty().isBoolean().withMessage('Item Active status must be a boolean'),
        validator
    ],

    checkBodyCaterogy: [
        check('categoryId').notEmpty().withMessage('Category ID cannot be empty'),
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
        check('itemIds').isArray({ min: 1 }).withMessage('ItemIds must be a non-empty array'),
        validator
    ],
};