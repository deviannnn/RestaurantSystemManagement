require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const amqp = require('amqplib');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
const QUEUE_NAME = 'kitchen_orders';

(async () => {
    try {
        const connectionOptions = {
            clientProperties: {
                connection_name: 'KitchenService'
            }
        };
        const connection = await amqp.connect(RABBITMQ_URL, connectionOptions);
        console.log('RabbitMQ connection established');

        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                console.log('Received order:', orderData);
                // Xử lý đơn hàng ở đây

                // Acknowledge message
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('Failed to set up RabbitMQ:', err);
    }
})();

async function processOrder(orderData) {
    // Xử lý dữ liệu đơn hàng nhận được
    console.log('Processing order:', orderData);
    // Thêm logic để lưu hoặc xử lý đơn hàng tại đây
    // Ví dụ: Lưu đơn hàng vào cơ sở dữ liệu hoặc gọi API khác để xử lý tiếp
}

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