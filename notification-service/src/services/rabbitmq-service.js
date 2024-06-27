const RabbitMQ = require('../config/rabbitmq');
const MailService = require('../services/mail.service')

module.exports = {
    async subEmail() {
        try {
            await RabbitMQ.subMessage('send_email', (emailData) => {
                console.log('\nReceived email:', emailData);
                
                const { type, fullName, gender, email, password, phone, link } = emailData;
                let mailComposer = null;
                
                if (type === 'active') {
                    mailComposer = MailService.composeActiveMail(fullName, gender, email, phone, link);
                }

                if (type === 'resetpassword') {
                    mailComposer = MailService.composeResetPasswordMail(fullName, gender, email, password);
                }

                MailService.sendEmail(mailComposer);
            });

            console.log('Notification Service is now listening for email.');
        } catch (error) {
            console.error('Failed to listen for email:', error);
            throw error;
        }
    },
}
