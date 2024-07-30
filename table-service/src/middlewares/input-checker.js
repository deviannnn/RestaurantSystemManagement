const createError = require('http-errors');
const { body } = require('express-validator');
const validator = require('./validator');

module.exports = {
    checkBodyCreateTable: [
        body('no')
            .notEmpty().withMessage('Table\'s No is required')
            .isString().withMessage('Table\'s No must be a string'),
        body('capacity')
            .notEmpty().withMessage('Table\'s Capacity is required')
            .isInt({ min: 1 }).withMessage('Table\'s Capacity must be an integer > 1'),
        body('isVip')
            .optional()
            .notEmpty().withMessage('Table\'s VIP status is required')
            .isBoolean().withMessage('Table\'s VIP status must be a boolean value'),
        body('status')
            .optional()
            .notEmpty().withMessage('Table\'s Status is required')
            .isIn(['free', 'occupied', 'reserved']).withMessage('Table\'s Status must must be either \'free\', \'occupied\', or \'reserved\''),
        body('active')
            .optional()
            .notEmpty().withMessage('Table\'s Active status is required')
            .isBoolean().withMessage('Table\'s Active status must be a boolean value'),
        validator,
    ],

    checkBodyUpdateTable: [
        body('no')
            .optional()
            .notEmpty().withMessage('Table\'s No is required')
            .isString().withMessage('Table\'s No must be a string'),
        body('capacity')
            .optional()
            .notEmpty().withMessage('Table\'s Capacity is required')
            .isInt({ min: 1 }).withMessage('Table\'s Capacity must be an integer > 1'),
        body('isVip')
            .optional()
            .notEmpty().withMessage('Table\'s VIP status is required')
            .isBoolean().withMessage('Table\'s VIP status must be a boolean value'),
        body('status')
            .optional()
            .notEmpty().withMessage('Table\'s Status is required')
            .isIn(['free', 'occupied', 'reserved']).withMessage('Table\'s Status must must be either \'free\', \'occupied\', or \'reserved\''),
        body('active')
            .optional()
            .notEmpty().withMessage('Table\'s Active status is required')
            .isBoolean().withMessage('Table\'s Active status must be a boolean value'),
        validator,
    ]
};