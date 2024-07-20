require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const convertTimezone = require('./middlewares/timezone');
const connectdb = require('./config/connectdb');
const RabbitMQ = require('./config/rabbitmq');
const TableService = require('./services/table-service');

connectdb(); //Test Database connection
(async () => {
    try {
        await RabbitMQ.connect();

        await RabbitMQ.consumeExchange('new-order-created', async (orderData) => {
            try {
                console.log('\n[CREATED] Received order:', orderData);
                // cập nhật trạng thái bàn
                await TableService.updateTable({ id: orderData.tableId, status: 'occupied' });
            } catch (error) {
                console.error('Error updating table status for new order:', error);
            }
        });

        await RabbitMQ.consumeQueue('open-close-table', async (tableData) => {
            try {
                console.log('\n[UPDATED] Received table:', tableData);
                // cập nhật trạng thái bàn
                if (tableData.open) await TableService.updateTable({ id: tableData.open, status: 'free' });
                if (tableData.close) await TableService.updateTable({ id: tableData.close, status: 'occupied' });
            } catch (error) {
                console.error('Error updating table status for table open-close:', error);
            }
        });
    } catch (error) {
        console.error('Failed to set up RabbitMQ subscriber:', error);
        process.exit(1); // Exit the process with error
    }
})();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(convertTimezone);

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