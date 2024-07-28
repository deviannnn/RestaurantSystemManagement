const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async publishOnPaymentCreated(paymentData) {
        try {
            await RabbitMQ.publishToExchange('new-payment-created', paymentData);
        } catch (error) {
            console.error('Error publishing order to exchange:', error);
            throw error;
        }
    }
};