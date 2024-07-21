const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

module.exports = {
    checkBodyCreateTable: [
        check('no').notEmpty().isString().withMessage('Table No must be a string'),
        check('capacity').notEmpty().isInt({ min: 1 }).withMessage('Table Capacity must be an integer > 1'),
        check('isVip').optional().notEmpty().isBoolean().withMessage('Table VIP status must be a boolean'),
        check('status').optional().notEmpty().isIn(['free', 'occupied', 'reserved']).withMessage('Table Status must must be either \'free\', \'occupied\', or \'reserved\''),
        check('active').optional().notEmpty().isBoolean().withMessage('Table Active status must be a boolean'),
        validator,
    ],

    checkBodyUpdateTable: [
        check('no').optional().notEmpty().isString().withMessage('Table No must be a string'),
        check('capacity').optional().notEmpty().isInt({ min: 1 }).withMessage('Table Capacity must be an integer > 1'),
        check('isVip').optional().notEmpty().isBoolean().withMessage('Table VIP status must be a boolean'),
        check('status').optional().notEmpty().isIn(['free', 'occupied', 'reserved']).withMessage('Table Status must must be either \'free\', \'occupied\', or \'reserved\''),
        check('active').optional().notEmpty().isBoolean().withMessage('Table Active status must be a boolean'),
        validator,
    ]
};