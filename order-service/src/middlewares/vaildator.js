const createError = require('http-errors');
const { validationResult } = require('express-validator');

const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const uniqueErrors = new Set();
        const errorDetail = errors.array().filter(error => {
            if (uniqueErrors.has(error.path)) return false;
            uniqueErrors.add(error.path);
            return true;
        }).map(error => ({ field: error.path, value: error.value, detail: error.msg }));
        return next(createError(400, 'Invalid input', { data: errorDetail }));
    }
    return next();
}

module.exports = validator;
