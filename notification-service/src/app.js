require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const amqp = require('amqplib/callback_api');
const MailService = require('./services/mail.service')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/api', require('./routes'));

amqp.connect('amqp://admin:admin@localhost:5672', (err, conn) => {
    if (err) throw err;
    console.log('RabbitMQ connection established');

    conn.createChannel((err, ch) => {
        if (err) throw err;
        ch.assertQueue('send_email', { durable: true });
        ch.consume('send_email', async (msg) => {
            console.log(`Message received from send_email: ${msg.content.toString()}`);
            
            const { type, fullName, gender, email, password, phone, link } = JSON.parse(msg.content.toString());
            let mailComposer = null;
            
            if (type === 'active') {
                mailComposer = MailService.composeActiveMail(fullName, gender, email, phone, link);
            }
            if (type === 'resetpassword') {
                mailComposer = MailService.composeResetPasswordMail(fullName, gender, email, password);
            }
            
            await MailService.sendEmail(mailComposer);
        }, { noAck: true });
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);

    const getError = (status) => {
        switch (status) {
            case 401:
                return { status: 401, error: 'Unauthorized', message: 'Your login session has expired. You are not allowed to access this resource.' };
            case 429:
                return { status: 429, error: 'Too Many Requests', message: 'Too many requests from this IP, please try again later.' };
            default:
                return { status: 404, error: 'Not Found', message: 'The requested resource could not be found.' };
        }
    }

    res.status(err.status || 500).json(getError(err.status || 500));
});

module.exports = app;