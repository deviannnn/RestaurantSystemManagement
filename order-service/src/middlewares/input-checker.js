const axios = require('axios');
const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

const API_GATEWAY = 'http://localhost:5000';
const OrderService = require('../services/order-service');
const OrderItemService = require('../services/order-item-service');

module.exports = {
    checkBodyTable: [
        check('tableId').trim().notEmpty().withMessage('Table ID is required'),
        validator
    ],

    checkTableExist: async (req, res, next) => {
        const tableId = req.body.tableId;

        if (!tableId) {
            return next();
        }

        try {
            const response = await axios.get(`${API_GATEWAY}/api/tables/${tableId}`); // no exist will throw
            req.table = response.data.data.table;
            return next();
        } catch (error) {
            return res.status(error.response.status).json(error.response.data);
        }
    },

    checkTableIsFree: async (req, res, next) => {
        const tableData = req.table;
        if (!tableData || tableData.status !== 'free') return next(createError(400, 'Table is currently not free'));
        return next();
    },

    checkOrderInProgress: async (req, res, next) => {
        try {
            const { orderId } = req.params;

            const orderData = await OrderService.getOrderById(orderId);
            if (!orderData) return next(createError(404, 'Order not found'));
            if (orderData.status !== 'in_progress') return next(createError(400, 'Order not in progress'));

            req.order = orderData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    checkOrderItem: async (req, res, next) => {
        try {
            const { orderItemId } = req.params;

            const orderItemData = await OrderItemService.getOrderItemById(orderItemId);
            if (!orderItemData) return next(createError(404, 'OrderItem not found'));

            req.orderItem = orderItemData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    // Expecting an array of items { itemId, quantity, note }
    checkBodyItems: [
        check('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
        check('items.*.itemId').trim().notEmpty().withMessage('Item ID is required'),
        check('items.*.quantity').trim().notEmpty().isInt().withMessage('Item Quantity must be an integer > 0'),
        check('items.*.note').optional().isString().withMessage('Item Note must be a string'),
        validator,
        async (req, res, next) => {
            const items = req.body.items;
            try {
                const itemIds = items.map(i => i.itemId);
                const response = await axios.post(`${API_GATEWAY}/api/items/batch`, { itemIds }); // no exist will throw
                // Gán dữ liệu trả về vào req
                req.itemDatas = response.data.data.items.map(itemRes => {
                    const item = items.find(i => i.itemId === itemRes.id);
                    return { ...item, name: itemRes.name, price: itemRes.price };
                });
                return next();
            } catch (error) {
                return res.status(error.response.status).json(error.response.data);
            }
        }
    ],

    // Expecting an array of orderItems { orderItemId, quantity, note }
    checkBodyOrderItems: [
        check('orderItems').isArray({ min: 1 }).withMessage('OrderItems must be a non-empty array'),
        check('orderItems.*.orderItemId').trim().notEmpty().withMessage('OrderItems ID is required'),
        check('orderItems.*.quantity').trim().notEmpty().isInt().withMessage('OrderItems Quantity must be an integer > 0'),
        check('orderItems.*.note').optional().isString().withMessage('OrderItems Note must be a string'),
        validator
    ],

    checkBodyUpdateOrder: [
        check('status')
            .optional()
            .trim()
            .notEmpty().withMessage('Order Status is required')
            .isIn(['in_progress', 'finished', 'cancelled']).withMessage('Order Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        check('active')
            .optional()
            .trim()
            .notEmpty().withMessage('Order\'s Active status is required')
            .isBoolean().withMessage('Order\'s Active status must be a boolean value'),
        check('tableId')
            .optional()
            .trim()
            .notEmpty().withMessage('Table ID is required'),
        validator
    ],

    checkBodyOrderItemStatus: [
        check('status').trim().notEmpty().isIn(['in_progress', 'finished', 'cancelled']).withMessage('OrderItem Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ]
};