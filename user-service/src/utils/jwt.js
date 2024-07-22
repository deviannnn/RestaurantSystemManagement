const jwt = require('jsonwebtoken');

const TOKEN = {
    active: {
        key: process.env.JWT_SECRETKEY_ACTIVETOKEN,
        expiresIn: '24h',
        algorithm: 'HS256'
    },
    access: {
        key: process.env.JWT_SECRETKEY_ACCESSTOKEN,
        expiresIn: '5m',
        algorithm: 'HS256'
    },
    refresh: {
        key: process.env.JWT_SECRETKEY_REFRESHTOKEN,
        expiresIn: '7d',
        algorithm: 'HS256'
    }
};

const generateToken = (payload, type, time = null) => {
    try {
        const tokenConfig = TOKEN[type];
        if (!tokenConfig) throw new Error('Invalid token type');

        const { key: secretKey, algorithm } = tokenConfig;
        const expiresIn = time || tokenConfig.expiresIn;
        
        return jwt.sign(payload, secretKey, { algorithm, expiresIn });
    } catch (error) {
        console.error('Error generating JWT:', error.message);
        throw error;
    }
};

const extractToken = (req) => {
    if (req.query && req.query.token) {
        return (req.query).token;
    } else if (req.cookies && req.cookies['jwt']) {
        return req.cookies['jwt'];
    } else if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

const decodeToken = (token, type) => {
    try {
        const tokenConfig = TOKEN[type];
        if (!tokenConfig) throw new Error('Invalid token type');
        const { key: secretKey } = tokenConfig;
        return jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Error decoding token:', error.message);
        throw error;
    }
};

module.exports = { generateToken, extractToken, decodeToken };