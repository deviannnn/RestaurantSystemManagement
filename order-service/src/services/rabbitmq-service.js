const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async pubOrderItem(orderData) {
        try {
            await RabbitMQ.publishMessage('orders-items-created', orderData);
        } catch (error) {
            console.error('Error publishing order to kitchen service:', error);
            throw error;
        }
    }
};