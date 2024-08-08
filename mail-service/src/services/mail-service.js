const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PUBLIC_IP_GATEWAY = process.env.PUBLIC_IP_GATEWAY || 'http://localhost:5000';

const activeMail = path.join(process.cwd(), './src/public/assets/html/activeMail.html');
const resetPasswordMail = path.join(process.cwd(), './src/public/assets/html/resetPasswordMail.html');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const verifySMTPConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified.');
    } catch (error) {
        console.error('SMTP connection verification failed:', error.message);
        throw new Error('SMTP connection is not ready.');
    }
};

const composeActiveMail = (fullName, gender, gmail, password, route) => {
    try {
        const replacements = {
            '{{FULLNAME}}': fullName,
            '{{GENDER}}': gender === true ? 'Mr' : 'Mrs',
            '{{USERNAME}}': gmail,
            '{{PASSWORD}}': password,
            '{{LINK}}': PUBLIC_IP_GATEWAY + route
        };

        let mailHtml = fs.readFileSync(activeMail, 'utf8');

        for (const [key, value] of Object.entries(replacements)) {
            mailHtml = mailHtml.replace(new RegExp(key, 'g'), value);
        }

        return {
            mail: gmail,
            subject: 'WELCOME NEW EMPLOYEES',
            content: mailHtml
        };
    } catch (error) {
        console.log(error.message);
        throw new Error('Fail to generate Active mail');
    }
}

const composeResetPasswordMail = (fullName, gender, gmail, password) => {
    try {
        const replacements = {
            '{{FULLNAME}}': fullName,
            '{{GENDER}}': gender === true ? 'Mr' : 'Mrs',
            '{{PASSWORD}}': password
        };

        let mailHtml = fs.readFileSync(resetPasswordMail, 'utf8');

        for (const [key, value] of Object.entries(replacements)) {
            mailHtml = mailHtml.replace(new RegExp(key, 'g'), value);
        }

        return {
            mail: gmail,
            subject: 'Reset Password for User',
            content: mailHtml
        };
    } catch (error) {
        console.log(error.message);
        throw new Error('Fail to generate ResetPassword mail');
    }
}

const sendEmail = async (mailComposer) => {
    const { mail, subject, content } = mailComposer;

    const mailOptions = {
        from: `Restaurant System <${process.env.EMAIL_USER}>`,
        to: mail,
        subject: subject,
        html: content
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Fail to send mail');
    }
};


module.exports = { sendEmail, composeActiveMail, composeResetPasswordMail, verifySMTPConnection };