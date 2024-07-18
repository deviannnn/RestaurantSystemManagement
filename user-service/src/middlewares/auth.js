const revokedTokens = new Set();
const { extractToken, decodeToken } = require('../utils/jwt');

const Redis = require('../services/redis-service');

const authenticate = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(400).json({ 
            success: false,
            message: 'No token provided!', 
            data: {}
        });
    }

    try {
        const decoded = await decodeToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(400).json({ 
            success: false,
            message: 'Authentication failed!',
            data: {}
        });
    }
}

const checkRevokedToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return res.status(400).json({ 
                success: false,
                message: 'No token provided!', 
                data: {}
            });
        }

        const revokedToken = await Redis.getTokenRevoked(`${token}`);
        
        if (revokedToken && revokedToken == 1) {
            return res.status(400).json({ 
                success: false,
                message: 'Token has been revoked!', 
                data: {}
            });
        }
        next();
    } catch (error) {
        next(error); // Pass error to Express error handler
    }
};

// const isPasswordChange = (req, res, next) => {
//     if (req.user && req.user.source === 'password_change') {
//         return next();
//     } else {
//         return res.redirect('/');
//     }
// };

const isAdmin = (req, res, next) => {
    if (req.user && req.user.roleId === '1') {
        return next();
    } else {
        return res.status(400).json({ 
            success: false,
            message: 'Requires admin rights', 
            data: {}
        });
    }
};

const isManager = (req, res, next) => {
    if (req.user && req.user.roleId === '2') {
        return next();
    } else {
        return res.status(400).json({ 
            success: false,
            message: 'Requires Manager rights', 
            data: {}
        });
    }
};

const isChef = (req, res, next) => {
    if (req.user && req.user.roleId === '3') {
        return next();
    } else {
        return res.status(400).json({ 
            success: false,
            message: 'Requires Chef rights', 
            data: {}
        });
    }
};

const isStaff = (req, res, next) => {
    if (req.user && req.user.roleId === '4') {
        return next();
    } else {
        return res.status(400).json({ 
            success: false,
            message: 'Requires Staff rights', 
            data: {}
        });
    }
};

module.exports = { authenticate, checkRevokedToken, revokedTokens, isAdmin, isManager, isChef, isStaff };