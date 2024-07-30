require('dotenv').config();
const axios = require('axios');
const createError = require('http-errors');
const { body, query } = require('express-validator');
const validator = require('./vaildator');

const CatalogServiceTarget = `${process.env.CATALOG_SERVICE_PROTOCAL}://${process.env.CATALOG_SERVICE_HOSTNAME}:${process.env.CATALOG_SERVICE_PORT}`;
const TableServiceTarget = `${process.env.TABLE_SERVICE_PROTOCAL}://${process.env.TABLE_SERVICE_HOSTNAME}:${process.env.TABLE_SERVICE_PORT}`;
const { OrderService, OrderItemService } = require('../services');

module.exports = {
    checkQueryDate: [
        query('fromDate')
            .optional()
            .isISO8601().toDate().withMessage('fromDate Query must be a valid date in (yyyy-mm-dd) format'),
        query('toDate')
            .optional()
            .isISO8601().toDate().withMessage('toDate Query must be a valid date in (yyyy-mm-dd) format'),
        validator
    ],

    checkQueryOrderItemStatus: [
        query('status')
            .optional()
            .isIn(['pending', 'in_progress', 'finished', 'cancelled']).withMessage('status Query must be either \'pending\', \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ],

    checkQueryGetAllOrders: [
        query('status')
            .optional()
            .isIn(['in_progress', 'finished', 'cancelled']).withMessage('status Query must be either \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ],

    checkBodyTable: [
        body('tableId').notEmpty().withMessage('Table ID is required'),
        validator
    ],

    checkTableExist: async (req, res, next) => {
        const tableId = req.body.tableId;

        if (!tableId) {
            return next();
        }

        try {
            const response = await axios.get(`${TableServiceTarget}/tables/${tableId}`, { headers: { Authorization: req.headers.authorization } }); // no exist will throw
            req.table = response.data.data.table;
            return next();
        } catch (error) {
            return res.status(error.response.status).json(error.response.data);
        }
    },

    checkTableIsFree: async (req, res, next) => {
        const tableData = req.table;
        if (!tableData || tableData.status !== 'free') return next(createError(400, `This Table[${tableData.id}] is currently not free`));
        return next();
    },

    checkOrderInProgress: async (req, res, next) => {
        try {
            const { orderId } = req.params;

            const orderData = await OrderService.getOrderById(orderId);
            if (!orderData) return next(createError(404, 'Order not found'));
            if (orderData.status !== 'in_progress') return next(createError(400, `This Order[${orderId}] is not in progress`));

            req.order = orderData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    checkOrderItem: async (req, res, next) => {
        try {
            const { orderItemId } = req.params;

            const orderItemData = await OrderItemService.getOrderItemById(orderItemId, false);
            if (!orderItemData) return next(createError(404, 'OrderItem not found'));

            req.orderItem = orderItemData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    // Expecting an array of items { itemId, quantity, note }
    checkBodyItems: [
        body('items')
            .isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
        body('items.*.itemId')
            .notEmpty().withMessage('Item ID is required'),
        body('items.*.quantity')
            .notEmpty().withMessage('Item\'s Quantity is required')
            .isInt({ min: 0 }).withMessage('Item\'s Quantity must be an integer > 0'),
        body('items.*.note')
            .optional()
            .trim()
            .isString().withMessage('OrderItem Note must be a string'),
        validator,
        async (req, res, next) => {
            const items = req.body.items;
            try {
                const itemIds = items.map(i => i.itemId);
                const response = await axios.post(`${CatalogServiceTarget}/items/batch`, { itemIds }, { headers: { Authorization: req.headers.authorization } }); // no exist will throw
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

    // Expecting an array of orderItems { id, quantity, note }
    checkBodyOrderItems: [
        body('orderItems')
            .isArray({ min: 1 }).withMessage('OrderItems must be a non-empty array'),
        body('orderItems.*.id')
            .notEmpty().withMessage('OrderItem ID is required'),
        body('orderItems.*.quantity')
            .optional()
            .notEmpty().withMessage('OrderItem\'s Quantity is required')
            .isInt({ min: 0 }).withMessage('OrderItem\'s Quantity must be an integer > 0'),
        body('orderItems.*.note')
            .optional()
            .trim()
            .isString().withMessage('OrderItem\'s Note must be a string'),
        validator,
        async (req, res, next) => {
            const orderId = req.order.id;
            const orderItemDatas = req.body.orderItems;
            const failures = [];
            const updatable = []

            const results = await Promise.allSettled(
                orderItemDatas.map(async (orderItem) => {
                    const { id, quantity, note } = orderItem;
                    const existingOrderItem = await OrderItemService.getOrderItemById(id, false);

                    if (!existingOrderItem) throw new Error(`This OrderItem not found`);
                    if (existingOrderItem.orderId !== orderId) throw new Error(`This OrderItem does not belong to Order[${orderId}]`);
                    if (existingOrderItem.status !== 'pending') throw new Error(`This OrderItem is not in pending status`);
                    if (quantity && quantity === existingOrderItem.quantity && !note) throw new Error(`This OrderItem has no changes to update`);

                    const newQuantity = quantity !== undefined ? quantity : existingOrderItem.quantity;
                    const newAmount = newQuantity * existingOrderItem.price;

                    updatable.push({ id, newQuantity, newAmount, note });
                })
            );

            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    failures.push({ id: orderItemDatas[index].id, detail: result.reason.message });
                }
            });

            if (failures.length > 0 && updatable.length === 0) return next(createError(400, 'Some order items could not be updated to order', { data: { failOrderItems: failures } }));

            req.failOrderItems = failures;
            req.updatableOrderItems = updatable;
            return next();
        }
    ],

    checkBodyUpdateOrder: [
        body('status')
            .optional()
            .trim()
            .notEmpty().withMessage('Order\'s Status is required')
            .isIn(['in_progress', 'finished', 'cancelled']).withMessage('Order\'s Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        body('active')
            .optional()
            .trim()
            .notEmpty().withMessage('Order\'s Active status is required')
            .isBoolean().withMessage('Order\'s Active status must be a boolean value'),
        body('tableId')
            .optional()
            .notEmpty().withMessage('Table ID is required'),
        validator
    ],

    checkBodyOrderItemStatus: [
        body('status')
            .trim()
            .notEmpty().withMessage('OrderItem\'s Status is required')
            .isIn(['in_progress', 'finished', 'cancelled']).withMessage('OrderItem\'s Status must be either \'in_progress\', \'finished\', or \'cancelled\''),
        validator
    ]
};