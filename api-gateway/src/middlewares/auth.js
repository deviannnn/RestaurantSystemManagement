const createError = require('http-errors');
const { extractToken, decodeToken } = require('../utils/jwt');

const Redis = require('../services/redis-service');

const checkRevokedToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) return next(createError(401, 'No token provided!'));
        const isRevokedToken = await Redis.getCacheData(`${token}`);
        if (isRevokedToken) return next(createError(401, 'Token has been revoked!'));
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
};

const verifyToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next(createError(401, 'No token provided!'));
    try {
        const decoded = decodeToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
}

module.exports = { checkRevokedToken, verifyToken };