const createError = require('http-errors');
const { validationResult } = require('express-validator');

const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetail = errors.array().map(error => ({ field: error.path, detail: error.msg }));
        next(createError(400, 'Invalid table input', { data: errorDetail }));
    }
    next();
}

module.exports = validator;