const revokedTokens = new Set();
const { extractToken, decodeToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(400).json({ message: '/login' });
    }

    try {
        const decoded = await decodeToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(400).json({ message: 'Xac thuc khong thanh cong' });
    }
}

const checkRevokedToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (revokedTokens.has(token)) {
        return res.status(400).json({ message: 'Token khong ton tai -> /login' });
    }
    
    next();
};

const isPasswordChange = (req, res, next) => {
    if (req.user && req.user.source === 'password_change') {
        return next();
    } else {
        return res.redirect('/');
    }
};

const isLoggedIn = (req, res, next) => {
    if (req.user && req.user.active && !req.user.locked && req.user.source === 'login') {
        return next();
    } else {
        return res.status(400).json({ message: '/login' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        return res.redirect('/');
    }
};

module.exports = { authenticate, checkRevokedToken, revokedTokens, isPasswordChange, isLoggedIn, isAdmin };