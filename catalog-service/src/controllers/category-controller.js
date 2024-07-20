const CategoryService = require('../services/category-service');
const { validationResult, check } = require('express-validator');

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({ field: error.path, msg: error.msg }));
        return res.status(400).json({ success: false, message: errorMessages, data: {} });
    }
    next();
}

module.exports = {
    // Create a new category
    createCategory: [
        check('name')
            .not().isEmpty().withMessage('Name cannot be empty.')
            .isString().withMessage('Name must be a string.'),
        check('description')
            .not().isEmpty().withMessage('Description cannot be empty.')
            .isString().withMessage('Description must be a string.'),
        check('active')
            .not().isEmpty().withMessage('Active status cannot be empty.')
            .isBoolean().withMessage('Active status must be a boolean.'),
        validate,
        async (req, res, next) => {
            try {
                const { name, description, active } = req.body;
                const newCategory = await CategoryService.createCategory(name, description, active);
                res.status(201).json({
                    success: true,
                    message: 'Create categories sucessfully!',
                    data: { newCategory }
                });
            } catch (error) {
                next(error);
            }
        }
    ],
    
    // Get all categories or get category by ID
    async getCategories(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const category = await CategoryService.getCategoryById(id);
                if (category) {
                    res.status(200).json({
                        sucess: true,
                        message: 'Get categories successfully!',
                        data: { category }
                    });
                } else {
                    res.status(404).json({ sucess: false, error: { message: 'Categories not found', data: {} } });
                }
            } else {
                const categories = await CategoryService.getAllCategories();
                res.status(200).json({
                    sucess: true,
                    message: 'Get all categories successfully!',
                    data: { categories }
                });
            }
        } catch (error) {
            next(error);
        }
    },

    // Update category by ID
    updateCategory:[
        check('id')
            .not().isEmpty().withMessage('ID cannot be empty.')
            .isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
        check('name')
            .not().isEmpty().withMessage('Name cannot be empty.')
            .isString().withMessage('Name must be a string.'),
        check('description')
            .not().isEmpty().withMessage('Description cannot be empty.')
            .isString().withMessage('Description must be a string.'),
        check('active')
            .not().isEmpty().withMessage('Active status cannot be empty.')
            .isBoolean().withMessage('Active status must be a boolean.'),
        validate,
        async (req, res, next)=>{
            try {
                const { id } = req.params;
                const { name, description, active } = req.body;
                const updatedCategory = await CategoryService.updateCategory({id, name, description, active});
                if (updatedCategory) {
                    res.status(200).json({
                        sucess: true,
                        message: 'Update categories successfully!',
                        data: { updatedCategory }
                    });
                } else {
                    res.status(404).json({ sucess: false, error: { message: 'Categories not found', data: {} } });
                }
            } catch (error) {
                next(error);
            }
        }
    ],
    // Delete category by ID
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            const deletedCategory = await CategoryService.deleteCategory(id);
            if (deletedCategory) {
                res.status(200).json({
                    success: true,
                    message: 'Delete categories successfully!',
                    data: { deletedCategory }
                });
            } else {
                res.status(404).json({ sucess: false, error: { message: 'Categories not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    }
};