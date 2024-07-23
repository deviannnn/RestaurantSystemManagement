const createError = require('http-errors');
const crypto = require('crypto');
const { extractToken, decodeToken } = require('../utils/jwt');

const RedisService = require('../services/redis-service');

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const checkRevokedToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) return next(createError(401, 'No token provided!'));

        const hashedToken = hashToken(token);
        const isRevokedToken = await RedisService.getCacheData(hashedToken);
        if (isRevokedToken) return next(createError(401, 'Token has been revoked!'));
        
        req.token = token;
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
};

const authenticate = (req, res, next) => {
    const token = req.token || extractToken(req);
    if (!token) return next(createError(401, 'No token provided!'));
    try {
        decodeToken(token);
        return next();
    } catch (error) {
        return next(createError(401, ''));
    }
}

module.exports = { checkRevokedToken, authenticate };