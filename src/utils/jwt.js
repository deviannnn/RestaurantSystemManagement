const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const generateJWT = async (account, source) => {
    try {
        let expiresIn = '24h';

        if (source === 'password_change') {
            expiresIn = '1m';
        }

        const token = await jwt.sign(
            {
                id: account.id,
                roleId: account.roleId,
                email: account.email,
                fullName: account.fullName,
                phone: account.phone,
                active: account.active,
                source: source
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

const extractToken = (req) => {
    if (req.query && req.query.token) {
        return (req.query).token;
    } else if (req.cookies && req.cookies['jwt']) {
        return req.cookies['jwt'];
    } else if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

const decodeToken = async (token) => {
    try {
        return await jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Error decoding token:', error.message);
        throw error;
    }
};

module.exports = { generateJWT, extractToken, decodeToken };
