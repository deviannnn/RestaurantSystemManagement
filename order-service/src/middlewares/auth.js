const createError = require('http-errors');

const rolesMap = { "admin": 1, "manager": 2, "chef": 3, "staff": 4 }

const extractUserFromHeaders = (req, res, next) => {
    if (!req.headers['x-user']) {
        return next(createError(401, ''));
    }
    req.user = JSON.parse(req.headers['x-user']);
    return next();
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createError(401, ''));
        }
        const userRoleId = req.user.roleId;
        if (!roles.some(role => rolesMap[role] === userRoleId)) {
            return next(createError(403, ''));
        }
        next();
    };
};

module.exports = { extractUserFromHeaders, authorize };