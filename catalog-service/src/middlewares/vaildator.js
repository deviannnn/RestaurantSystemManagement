const createError = require('http-errors');
const { validationResult } = require('express-validator');

const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetail = errors.array().map(error => ({ field: error.path, value: error.value, detail: error.msg }));
        return next(createError(400, 'Invalid input', { data: errorDetail }));
    }
    return next();
}

module.exports = validator;