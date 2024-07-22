const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async publishNewMail(mailData) {
        try {
            await RabbitMQ.publishToQueue('send-mail', mailData);
        } catch (error) {
            console.error('Error publishing mail to mail service:', error);
            throw error;
        }
    }
};