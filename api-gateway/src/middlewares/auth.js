const createError = require('http-errors');
const murmurhash = require('murmurhash');
const { extractToken, decodeToken } = require('../utils/jwt');

const RedisService = require('../services/redis-service');

const hashToken = (token) => {
    return murmurhash.v3(token).toString(36);
};

const checkRevokedToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) return next(createError(401, 'No token provided!'));

        const hashedToken = hashToken(token);
        const isRevokedToken = await RedisService.getCacheData(hashedToken);
        if (isRevokedToken) return next(createError(401, 'Token has been revoked!'));

        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
};

const authenticate = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next(createError(401, 'No token provided!'));
    try {
        decodeToken(token);
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
}

module.exports = { checkRevokedToken, authenticate };