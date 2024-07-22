require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRETKEY_ACCESSTOKEN, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    // only chef
                    if (decoded.roleId === 3)
                        resolve(decoded);
                    else
                        reject()
                }
            });
        });
    }
};