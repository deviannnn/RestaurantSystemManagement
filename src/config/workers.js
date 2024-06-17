const { consumeQueue } = require('./consumer');
const { sendEmail } = require('../services/mail.service');

consumeQueue('send_email', async (message) => {
    const { to, subject, text } = JSON.parse(message);
    // Logic để gửi email
    await sendEmail(to, subject, text);
    console.log(`Sending email to ${to}`);
});