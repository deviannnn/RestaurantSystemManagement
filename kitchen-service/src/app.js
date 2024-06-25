require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const RabbitMQService = require('./services/rabbitmq-service');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

RabbitMQService.subOrderItem();

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);

    const getError = (status) => {
        switch (status) {
            case 401:
                return {
                    success: false,
                    error: {
                        header: 'Unauthorized Access',
                        message: 'Your session has expired or you do not have the necessary permissions to access this resource.'
                    }
                };
            case 403:
                return {
                    success: false,
                    error: {
                        header: 'Access Denied',
                        message: 'You do not have the required permissions to access this resource.'
                    }
                };
            case 404:
                return {
                    success: false,
                    error: {
                        header: 'Resource Not Found',
                        message: 'The resource you are looking for could not be located.'
                    }
                };
            case 429:
                return {
                    success: false,
                    error: {
                        header: 'Rate Limit Exceeded',
                        message: 'You have made too many requests in a short period. Please try again later.'
                    }
                };
            default:
                return {
                    success: false,
                    error: {
                        header: 'Internal Server Error',
                        message: 'An unexpected error occurred on the server. Please try again later or contact support if the issue persists.'
                    }
                }
        }
    }

    res.status(err.status || 500).json(getError(err.status || 500));
});

module.exports = app;