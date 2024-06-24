const revokedTokens = new Set();
const { extractToken, decodeToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(400).json({ 
            success: false,
            message: 'Vui long dang nhap', 
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
            message: 'Xac thuc khong thanh cong',
            data: {}
        });
    }
}

const checkRevokedToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (revokedTokens.has(token)) {
        return res.status(400).json({ 
            success: false,
            message: 'Token khong ton tai -> /login', 
            data: {}
        });
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

module.exports = { authenticate, checkRevokedToken, revokedTokens, isPasswordChange, isAdmin };