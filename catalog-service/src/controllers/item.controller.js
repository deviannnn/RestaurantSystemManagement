const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const ItemService = require('../services/item.service');
const CategoryService = require('../services/category.service');
const upload = require('../middlewares/upload');
const Redis = require('../services/redis-service');
const { validationResult, check } = require('express-validator');

const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetail = errors.array().map(error => ({ field: error.path, value: error.value, detail: error.msg }));
        next(createError(400, 'Invalid input', { data: errorDetail }));
    }
    next();
}

module.exports = {
    // Create a new item
    createItem: [
        check('name')
            .not().isEmpty().withMessage('Name cannot be empty.')
            .isString().withMessage('Name must be a string.'),
        check('price')
            .not().isEmpty().withMessage('Price cannot be empty.')
            .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
        check('description')
            .not().isEmpty().withMessage('Description cannot be empty.')
            .isString().withMessage('Description must be a string.'),
        check('available')
            .not().isEmpty().withMessage('Available status cannot be empty.')
            .isBoolean().withMessage('Available status must be a boolean.'),
        check('categoryId')
            .not().isEmpty().withMessage('Category ID cannot be empty.')
            .isInt({ min: 1 }).withMessage('Category ID must be a positive integer.'),
        validator,
        upload.single('image'),
        async (req, res, next) => {
            try {
                const { name, price, description, available, categoryId } = req.body;
                const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const newItem = await ItemService.createItem(name, price, image, description, available, categoryId);
                return res.status(201).json({
                    success: true,
                    message: 'Create item sucessfully!',
                    data: { newItem }
                });
            } catch (error) {
                next(error);
            }
        }
    ],

    async toggleAvailable(req, res, next) {
        try {
            const { id } = req.params;
            const { available } = req.body;
            
            const toggledItem = await ItemService.updateItem({ id, available });
            if (toggledItem) {

                await Redis.delItemsToRedis('allItemsClient');

                const allItemsClient = await CategoryService.getAllCategories(true);
                await Redis.saveItemsForClient({
                    key: 'allItemsClient',
                    value: JSON.stringify(allItemsClient),
                    expireTimeInSeconds: 50
                });

                return res.status(200).json({
                    sucess: true,
                    message: 'Toggle item successfully!',
                    data: { toggledItem }
                });
            } else {
                return res.status(404).json({ sucess: false, error: { message: 'Item not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },

    // Get all items or get item by ID
    async getItems(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const item = await ItemService.getItemById(id);
                if (!item) {
                    return res.status(404).json({ sucess: false, error: { message: 'Item not found', data: {} } });
                }
                return res.status(200).json({
                    sucess: true,
                    message: 'Get item successfully!',
                    data: { item }
                });
            } else {
                const allItems = await ItemService.getAllItems();
                return res.status(200).json({
                    sucess: true,
                    message: 'Get all items successfully!',
                    data: { allItems }
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async getItemsForClient(req, res, next) {
        try {
            const qName = req.query.name;

            if (qName) {
                const find = await ItemService.searchItemByName(qName);
                if (!find) {
                    return res.status(404).json({ sucess: false, error: { message: 'Could not find a dish with that name', data: {} } });
                }
                return res.status(200).json({
                    sucess: true,
                    message: 'Get all items for client successfully!',
                    data: { find }
                });
            } else {
                const allItemsClient = await Redis.getItemsToRedis('allItemsClient');

                if (allItemsClient) {
                    return res.status(300).json({
                        sucess: true,
                        message: 'Get all items for client successfully!',
                        data: JSON.parse(allItemsClient)
                    });
                }

                const item = await CategoryService.getAllCategories(true);

                await Redis.saveItemsForClient({
                    key: 'allItemsClient',
                    value: JSON.stringify(item),
                    expireTimeInSeconds: 10
                });
                
                return res.status(200).json({
                    sucess: true,
                    message: 'Get all items for client successfully!',
                    data: { item }
                });
            }
        } catch (error) {
            next(error);
        }
    },

    batchValidator: [inputChecker.checkItemIds, async (req, res, next) => {
        try {
            const { itemIds } = req.body; // Expecting an array of itemIds
            const { validItems, invalidItems } = await ItemService.getItemsByListIds(itemIds);

            if (invalidItems.length > 0) {
                return next(createError(400, 'Some items are not valid', { data: { items: invalidItems } }));
            }

            res.status(200).json({ success: true, message: 'All items are valid', data: { items: validItems } });
        } catch (error) {
            next(error);
        }
    }],

    // Update item by ID
    updateItem: [
        check('name').optional()
            .not().isEmpty().withMessage('Name cannot be empty.')
            .isString().withMessage('Name must be a string.'),
        check('price').optional()
            .not().isEmpty().withMessage('Price cannot be empty.')
            .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
        // check('image')
        //     .not().isEmpty().withMessage('Image cannot be empty.')
        //     .isURL().withMessage('Image must be a valid URL.'),
        check('description').optional()
            .not().isEmpty().withMessage('Description cannot be empty.')
            .isString().withMessage('Description must be a string.'),
        check('available').optional()
            .not().isEmpty().withMessage('Available status cannot be empty.')
            .isBoolean().withMessage('Available status must be a boolean.'),
        check('active').optional()
            .not().isEmpty().withMessage('Active status cannot be empty.')
            .isBoolean().withMessage('Active status must be a boolean.'),
        check('categoryId').optional()
            .not().isEmpty().withMessage('Category ID cannot be empty.')
            .isInt({ min: 1 }).withMessage('Category ID must be a positive integer.'),
        validator,
        // upload.single('image'), // Middleware xử lý upload ảnh
        async (req, res, next) => {
            try {
                const { id } = req.params;
                const { name, price, description, available, active, categoryId } = req.body;
                //const image = req.file ? req.file.path : null; // Đường dẫn ảnh sau khi upload
                const image = 'temp.png';
                const updatedItem = await ItemService.updateItem({ id, name, price, image, description, available, active, categoryId });
                if (updatedItem) {
                    return res.status(200).json({
                        sucess: true,
                        message: 'Update item successfully!',
                        data: { updatedItem }
                    });
                } else {
                    return res.status(404).json({ sucess: false, error: { message: 'Item not found', data: {} } });
                }
            } catch (error) {
                next(error);
            }
        }
    ],

    // Delete item by ID
    async deleteItem(req, res, next) {
        try {
            const { id } = req.params;
            const deletedItem = await ItemService.deleteItem(id);
            if (deletedItem) {
                return res.status(200).json({
                    sucess: true,
                    message: 'Delete item successfully!',
                    data: { deletedItem }
                });
            } else {
                return res.status(404).json({ sucess: false, error: { message: 'Item not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    }
};