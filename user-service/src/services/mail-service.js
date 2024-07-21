const jwt = require('../utils/jwt');
const mailTemplate = require('../utils/mail-template');

const domain = `http://${process.env.HOST_NAME}:${process.env.PORT}`;

const composeActiveMail = (userID, fullName, gender, email, phone) => {
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

module.exports = { composeActiveMail };