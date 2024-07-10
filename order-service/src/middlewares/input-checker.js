const axios = require('axios');
const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

const CatalogService = process.env.CATALOG_SERVICE_HOSTNAME || 'http://localhost:5000';
const TableService = process.env.TABLE_SERVICE_HOSTNAME || 'http://localhost:5004';
const OrderService = require('../services/order-service');

module.exports = {
    checkTableStatus: [
        check('tableId').notEmpty().withMessage('Table ID cannot be empty'),
        validator,
        async (req, res, next) => {
            const tableId = req.body.tableId;
            try {
                const response = await axios.get(`${TableService}/api/v1/tables/${tableId}`);
                const tableData = response.data.data.table;
                if (tableData.status !== 'free') {
                    return next(createError(400, 'Table is currently not free'));
                }
                // req.table = tableData;
                next();
            } catch (error) {
                return res.status(error.response.status).json(error.response.data);
            }
        }
    ],

    // Expecting an array of items { itemId, quantity, note }
    checkAddItemsToOrder: [
        async (req, res, next) => {
            const { orderId } = req.params;
            const order = await OrderService.getOrderById(orderId);
            if (!order) {
                return next(createError(404, 'Order not found'));
            }
            next();
        },
        check('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
        check('items.*.itemId').notEmpty().withMessage('Item ID cannot be empty'),
        check('items.*.quantity').notEmpty().isInt().withMessage('Item quantity must be an integer > 0'),
        check('items.*.note').optional().isString().withMessage('Item note must be a string'),
        validator,
        async (req, res, next) => {
            const items = req.body.items;
            try {
                const itemIds = items.map(i => i.itemId);
                const response = await axios.post(`${CatalogService}/api/v1/items/batch`, { itemIds });
                // Gán dữ liệu trả về vào req
                req.itemDatas = response.data.data.items.map(itemRes => {
                    const item = items.find(i => i.itemId === itemRes.id);
                    return { ...item, name: itemRes.name, price: itemRes.price };
                });
                next();
            } catch (error) {
                return res.status(error.response.status).json(error.response.data);
            }
        }
    ],
};