const axios = require('axios');
const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

const CatalogService = process.env.CATALOG_SERVICE_HOSTNAME || 'http://localhost:5000';
const TableService = process.env.TABLE_SERVICE_HOSTNAME || 'http://localhost:5004';
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');

module.exports = {
    checkTable: [
        check('tableId').optional().notEmpty().withMessage('Table ID cannot be empty'),
        validator,
        async (req, res, next) => {
            const tableId = req.body.tableId;
            try {
                const response = await axios.get(`${TableService}/api/v1/tables/${tableId}`);
                req.table = response.data.data.table;
                next();
            } catch (error) {
                return res.status(error.response.status).json(error.response.data);
            }
        }
    ],

    checkOrderInProgress: async (req, res, next) => {
        try {
            const { orderId } = req.params;
            
            const orderData = await OrderService.getOrderById(orderId);
            if (!orderData) return next(createError(404, 'Order not found'));
            if (orderData.status !== 'in_progress') return next(createError(400, 'Order not in progress'));

            req.order = orderData;
            next();
        } catch (error) {
            next(error);
        }
    },

    checkOrderItem: async (req, res, next) => {
        try {
            const { orderItemId } = req.params;

            const orderItemData = await OrderItemService.getOrderItemById(orderItemId);
            if (!orderItemData) return next(createError(404, 'OrderItem not found'));

            req.orderItem = orderItemData;
            next();
        } catch (error) {
            next(error);
        }
    },

    // Expecting an array of items { itemId, quantity, note }
    checkBodyItems: [
        check('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
        check('items.*.itemId').notEmpty().withMessage('Item ID cannot be empty'),
        check('items.*.quantity').notEmpty().isInt().withMessage('Item Quantity must be an integer > 0'),
        check('items.*.note').optional().isString().withMessage('Item Note must be a string'),
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

    // Expecting an array of orderItems { orderItemId, quantity, note }
    checkBodyOrderItems: [
        check('orderItems').isArray({ min: 1 }).withMessage('OrderItems must be a non-empty array'),
        check('orderItems.*.orderItemId').notEmpty().withMessage('OrderItems ID cannot be empty'),
        check('orderItems.*.quantity').notEmpty().isInt().withMessage('OrderItems Quantity must be an integer > 0'),
        check('orderItems.*.note').optional().isString().withMessage('OrderItems Note must be a string'),
        validator
    ],

    checkBodyUpdateOrder: [
        check('totalQuantity').optional().notEmpty().isInt({ min: 0 }).withMessage('Order TotalQuantity must be an integer >= 0'),
        check('subAmount').optional().notEmpty().isFloat({ min: 0 }).withMessage('Order SubAmount must be a real number >= 0'),
        check('status').optional().notEmpty().isIn(['in_progress', 'finished', 'cancelled']).withMessage('Order Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ],

    checkBodyOrderStatus: [
        check('status').notEmpty().isIn(['finished', 'cancelled']).withMessage('Order Status must be either \'finished\' or \'cancelled\''),
        validator
    ],

    checkBodyOrderItemStatus: [
        check('status').notEmpty().isIn(['in_progress', 'finished', 'cancelled']).withMessage('OrderItem Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ]
};