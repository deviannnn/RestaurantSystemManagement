const nodemailer = require('nodemailer');
const jwt = require('../utils/jwt');
const mailTemplate = require('../utils/mail-template');

const domain = `http://${process.env.HOST_NAME}:${process.env.PORT}`;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const composeActiveMail = async (userID, fullName, gender, email, phone) => {
    try {
        const token = jwt.generateActiveToken(userID);
        const link = `${domain}/active?token=${token}`;

        return {
            to: email,
            subject: 'WELCOME NEW EMPLOYEES',
            text: mailTemplate.ActiveMail(fullName, gender, email, phone, link)
        };
    } catch (error) {
        console.log(error.message);
        throw new Error('Error generate active mail.');
    }
}

const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `Restaurant System <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, message: `Error sending email: ${error.message}` };
    }
};

module.exports = { composeActiveMail, sendEmail };