const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

module.exports = {
    checkItemIds: [
        check('itemIds').isArray({ min: 1 }).withMessage('ItemIds must be a non-empty array'),
        validator
    ],
};