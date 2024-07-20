const createError = require('http-errors');
const { extractToken, decodeToken } = require('../utils/jwt');

const Redis = require('../services/redis-service');

const checkRevokedToken = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next(createError(401, 'No token provided!'));
        }

        const revokedToken = await Redis.getTokenRevoked(`${token}`);

        if (revokedToken && revokedToken == 1) {
            return next(createError(401, 'Token has been revoked!'));
        }
        next();
    } catch (error) {
        return next(createError(401, ''));
    }
};

const verifyToken = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return next(createError(401, 'No token provided!'));
    }

    try {
        const decoded = await decodeToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
}

module.exports = { checkRevokedToken, verifyToken };