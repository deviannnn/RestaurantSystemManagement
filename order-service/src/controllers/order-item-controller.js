const createError = require('http-errors');

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
     * orderItemId ? = req.params
     * 
     */
    async getOrderItems(req, res, next) {
        try {
            const { orderItemId } = req.params;
            if (orderItemId) {
                const orderItem = await OrderItemService.getOrderItemById(orderItemId);
                if (!orderItem) return next(createError(404, 'OrderItem not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get orderItem successfully!',
                    data: { orderItem }
                });
            } else {
                const orderItems = await OrderItemService.getAllOrderItems();
                res.status(200).json({
                    success: true,
                    message: 'Get all orderItems successfully!',
                    data: { orderItems }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

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