const axios = require('axios');
const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const CatalogServiceTarget = `${process.env.CATALOG_SERVICE_PROTOCAL}://${process.env.CATALOG_SERVICE_HOSTNAME}:${process.env.CATALOG_SERVICE_PORT}`;
const { OrderItemService } = require('../services');

module.exports = {
    /** Expected Input
     * 
     * { orderId, itemId, quantity, price, amount, note, status, active } = req.body;
     * 
     */
    async createOrderItem(req, res, next) {
        try {
            const { orderId, itemId, quantity, price, amount, note, status, active } = req.body;
            const newOrderItem = await OrderItemService.createOrderItem(orderId, itemId, quantity, price, amount, note, status, active);
            res.status(201).json({
                success: true,
                message: 'New orderItem was created successfully!',
                data: { orderItem: newOrderItem }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * include ? = req.query
     * 
     */
    async getOrderItem(req, res, next) {
        try {
            const { orderItemId } = req.params;
            const include = req.query.include === 'false' || req.query.include === '0' ? false : true;

            const orderItem = await OrderItemService.getOrderItemById(orderItemId, include);
            if (!orderItem) return next(createError(404, 'OrderItem not found'));

            res.status(200).json({
                success: true,
                message: 'Get orderItem successfully!',
                data: { orderItem }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { orderId, status, fromDate, toDate } = req.query
     * 
     */
    getAllOrderItems: [
        inputChecker.checkQueryDate,
        inputChecker.checkQueryOrderItemStatus,
        async (req, res, next) => {
            try {
                const { orderId, status, fromDate, toDate } = req.query;

                const orderItems = await OrderItemService.getAllOrderItems(orderId, status, fromDate, toDate);
                res.status(200).json({
                    success: true,
                    message: 'Get all orderItems successfully!',
                    data: {
                        status: status ? status : "All Status",
                        fromDate: fromDate ? fromDate : "Today",
                        toDate: toDate ? toDate : "Today",
                        orderItems
                    }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * { status, fromDate, toDate } = req.query
     * 
     */
    getStatisticalOrderItems: [
        inputChecker.checkQueryDate,
        inputChecker.checkQueryOrderItemStatus,
        async (req, res, next) => {
            try {
                const { status, fromDate, toDate } = req.query;

                const orderItems = await OrderItemService.getStatisticalOrderItems(status, fromDate, toDate);
                if (!orderItems || orderItems.length === 0) return next(createError(404, 'No statistics on item data'));

                const results = await Promise.all(orderItems.map(async (item) => {
                    try {
                        const itemResponse = await axios.get(`${CatalogServiceTarget}/items/${item.itemId}`, {
                            headers: { Authorization: req.headers.authorization }
                        });
                        const { name, image, categoryId } = itemResponse.data.data.item;
                        return {
                            itemId: item.itemId,
                            name,
                            image,
                            categoryId,
                            totalQuantity: item.dataValues.totalQuantity,
                        };
                    } catch (error) {
                        if (error.response) {
                            return res.status(error.response.status).json(error.response.data);
                        }
                        throw error;
                    }
                }));

                res.status(200).json({
                    success: true,
                    message: 'Get statistics on item data successfully!',
                    data: {
                        status: status ? status : "All Status",
                        fromDate: fromDate ? fromDate : "Today",
                        toDate: toDate ? toDate : "Today",
                        results
                    }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * orderItemId = req.params
     * { orderId, itemId, quantity, price, amount, note, status, active } = req.body
     * 
     */
    async updateOrderItem(req, res, next) {
        try {
            const { orderItemId } = req.params;
            const { orderId, itemId, quantity, price, amount, note, status, active } = req.body;

            const updatedOrderItem = await OrderItemService.updateOrderItem({ id: orderItemId, orderId, itemId, quantity, price, amount, note, status, active });
            if (!updatedOrderItem) return next(createError(404, 'OrderItem not found'));

            res.status(200).json({
                sucess: true,
                message: 'Update orderItem successfully!',
                data: { orderItem: updatedOrderItem }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * orderItemId = req.params
     * 
     */
    async deleteOrderItem(req, res, next) {
        try {
            const { orderItemId } = req.params;

            const deletedOrderItem = await OrderItemService.deleteOrderItem(orderItemId);
            if (!deletedOrderItem) return next(createError(404, 'OrderItem not found'));

            res.status(200).json({
                success: true,
                message: 'Delete orderItem successfully!',
                data: { orderItem: deletedOrderItem }
            });
        } catch (error) {
            return next(error);
        }
    }
};