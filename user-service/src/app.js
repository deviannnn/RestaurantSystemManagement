require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const convertTimezone = require('./middlewares/timezone');
const connectDB = require('./config/connectDB');
const RabbitMQ = require('./config/rabbitmq');
const Redis = require('./config/redis');
connectDB(); //Test Database connection

const startRabbitMQ = async () => {
    try {
        await RabbitMQ.connect();
        console.log('RabbitMQ is connected');
    } catch (error) {
        console.error('Failed to start RabbitMQ:', error);
    }
};
const startRedis = async () => {
    try {
        await Redis.connect();
        console.log('Redis is connected');
    } catch (error) {
        console.error('Failed to start Redis:', error);
    }
};

startRabbitMQ();
startRedis();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(convertTimezone);

app.use('/api', require('./routes'));

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