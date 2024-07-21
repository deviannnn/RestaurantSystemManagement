const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const secretKeyRefreshToken = process.env.JWT_SECRET_REFRESHTOKEN;

const generateActiveToken = (userID) => {
    try {
        const payload = { id: userID };
        const token = jwt.sign(
            payload,
            secretKey,
            { algorithm: 'HS256', expiresIn: '24h' }
        );

        return token;
    } catch (error) {
        console.error('Error generating JWT:', error.message);
        throw error;
    }
};

const generateAccessToken = async (user) => {
    try {
        const expiresIn = '5m';
        const token = await jwt.sign(
            {
                id: user.id,
                roleId: user.roleId,
                fullName: user.fullName
            },
            secretKey,
            {
                algorithm: 'HS256',
                expiresIn: expiresIn
            }
        );
        return token;
    } catch (error) {
        console.error('Error generating JWT:', error.message);
        throw error;
    }
};

const generateRefreshToken = async (user) => {
    try {
        let expiresIn = '7d'

        const token = await jwt.sign(
            {
                id: user.id,
                roleId: user.roleId
            },
            secretKeyRefreshToken,
            {
                algorithm: 'HS256',
                expiresIn: expiresIn
            }
        );
        return token;
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

const decodeToken = async (token) => {
    try {
        return await jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Error decoding token:', error.message);
        throw error;
    }
};

module.exports = { generateActiveToken, generateAccessToken, generateRefreshToken, extractToken, decodeToken };