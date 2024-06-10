const revokedTokens = new Set();
const { extractToken, decodeToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = await decodeToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.redirect('/login');
    }
}

const checkRevokedToken = (req, res, next) => {
    const token = req.cookies['jwt'];

    if (revokedTokens.has(token)) {
        return res.redirect('/login');
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
    if (req.user && req.user.actived && !req.user.locked && req.user.source === 'login') {
        return next();
    } else {
        return res.redirect('/login');
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