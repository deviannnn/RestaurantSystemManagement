const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async publishOnOrderCreated(orderData) {
        try {
            await RabbitMQ.publishToExchange('new-order-created', orderData);
        } catch (error) {
            console.error('Error publishing order to exchange:', error);
            throw error;
        }
    },

    async publishOnOpenCloseTable(tableData) {
        try {
            await RabbitMQ.publishToQueue('open-close-table', tableData);
        } catch (error) {
            console.error('Error publishing table to table service:', error);
            throw error;
        }
    },

    async publishOrderToKitchen(orderData) {
        try {
            await RabbitMQ.publishToQueue('order-to-kitchen', orderData);
        } catch (error) {
            console.error('Error publishing order to kitchen service:', error);
            throw error;
        }
    },

    async publishOrderToWaiter(orderData) {
        try {
            await RabbitMQ.publishToQueue('order-to-waiter', orderData);
        } catch (error) {
            console.error('Error publishing order to kitchen service:', error);
            throw error;
        }
    }
};