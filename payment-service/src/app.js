require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Connect to database
const connectdb = require('./config/connectdb');
connectdb();

// Connect to rabbitmq
const RabbitMQ = require('./config/rabbitmq');
(async () => {
    try {
        await RabbitMQ.connect();
        console.log(`RabbitMQ connection established on [${RabbitMQ.rabbitmqUrl}]`);
    } catch (error) {
        console.error('[ERROR] Config -', RabbitMQ.rabbitmqUrl);
        console.error('[ERROR] Failed to connect to RabbitMQ -', error);
        process.exit(1);
    }
})();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);

    const getError = (err) => {
        switch (err.status) {
            case 400:
                return {
                    header: 'Bad Request',
                    message: err.message || 'Your session has expired or you do not have the necessary permissions to access this resource.'
                };
            case 401:
                return {
                    header: 'Unauthorized Access',
                    message: err.message || 'Your session has expired or you do not have the necessary permissions to access this resource.'
                };
            case 403:
                return {
                    header: 'Access Denied',
                    message: err.message || 'You do not have the required permissions to access this resource.'
                };
            case 404:
                return {
                    header: 'Resource Not Found',
                    message: err.message || 'The resource you are looking for could not be located.'
                };
            case 429:
                return {
                    header: 'Rate Limit Exceeded',
                    message: err.message || 'You have made too many requests in a short period. Please try again later.'
                };
            default:
                return {
                    header: 'Internal Server Error',
                    message: err.message || 'An unexpected error occurred on the server. Please try again later or contact support if the issue persists.'
                }
        }
    }

    res.status(err.status || 500).json({ success: false, error: { ...getError(err), data: err.data || {} } });
});

module.exports = app;