const jwt = require('jsonwebtoken');
const ACCESSTOKEN_KEY = process.env.JWT_SECRETKEY_ACCESSTOKEN;

const extractToken = (req) => {
    if (req.query && req.query.token) {
        return (req.query).token;
    } else if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

const decodeToken = (token) => {
    try {
        return jwt.verify(token, ACCESSTOKEN_KEY);
    } catch (error) {
        console.error('Error decoding token:', error.message);
        throw error;
    }
};

module.exports = { extractToken, decodeToken };