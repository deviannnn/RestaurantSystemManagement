const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async pubEmail(emailData) {
        try {
            await RabbitMQ.publishToQueue('send_email', emailData);
        } catch (error) {
            console.error('Error publishing email to notification service:', error);
            throw error;
        }
    }
};