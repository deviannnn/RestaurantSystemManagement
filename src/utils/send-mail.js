const nodemailer = require('nodemailer');

const mailUser = process.env.EMAIL_USER;
const mailPassword = process.env.EMAIL_PASSWORD;

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mailUser,
            pass: mailPassword
        }
    });

    const mailOptions = {
        from: 'Restaurant System <phungphuchau2002@gmail.com>',
        to,
        subject,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, message: `Error sending email: ${error}` };
    }
};

module.exports = { sendEmail };