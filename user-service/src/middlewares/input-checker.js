const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

module.exports = {
    checkBodyCreateRole: [
        check('name').notEmpty().isString().withMessage('Role Name must be a string'),
        check('active').optional().notEmpty().isBoolean().withMessage('Role Active status must be a boolean'),
        validator,
    ],

    checkBodyUpdateRole: [
        check('name').optional().notEmpty().isString().withMessage('Role Name must be a string'),
        check('active').optional().notEmpty().isBoolean().withMessage('Role Active status must be a boolean'),
        validator,
    ]
};