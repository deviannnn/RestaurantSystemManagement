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

    async publishOnChangedTable(tableData) {
        try {
            await RabbitMQ.publishToQueue('table-changed', tableData);
        } catch (error) {
            console.error('Error publishing table to table service:', error);
            throw error;
        }
    },

    async publishOrderItemOnCreated(orderData) {
        try {
            await RabbitMQ.publishToQueue('added-items-to-order', orderData);
        } catch (error) {
            console.error('Error publishing order to kitchen service:', error);
            throw error;
        }
    },

    async publishOrderItemOnUpdated(orderData) {
        try {
            await RabbitMQ.publishToQueue('updated-items-to-order', orderData);
        } catch (error) {
            console.error('Error publishing order to kitchen service:', error);
            throw error;
        }
    }
};