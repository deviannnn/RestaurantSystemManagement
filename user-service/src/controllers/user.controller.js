const UserService = require('../services/user.service');
const { sendToQueue } = require('../config/producer');
const { generateJWT, generateRefreshToken, decodeToken, extractToken, revokedTokens } = require('../utils/jwt');
const { validationResult, check } = require('express-validator');

const jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');
const generatePassword = require('generate-password');

const domain = `http://${process.env.HOST_NAME}:${process.env.PORT}`;

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({ field: error.path, msg: error.msg }));
        return res.status(400).json({ success: false, message: errorMessages, data: {} });
    }
    next();
}

class UserController {
    static register = [
        check('fullName')
            .not().isEmpty().withMessage('Fullname cannot be empty.')
            .matches(/^[\p{L}\s]*$/u).withMessage('Fullname should only contain letters and spaces.'),

        check('gender')
            .not().isEmpty().withMessage('Gender cannot be empty.')
            .isIn(['true', 'false']).withMessage('Invalid gender value.'),

        check('nationalId')
            .not().isEmpty().withMessage('National ID cannot be empty.')
            .isNumeric().withMessage('National ID must contain only numbers.')
            .isLength(12).withMessage('National ID must be 12 digits long.')
            .custom(async (nationalId) => {
                const existingAccount = await UserService.getUserByNationalId(nationalId);
                if (existingAccount) {
                    throw new Error('National ID already exists.');
                }

            }),

        check('phone')
            .not().isEmpty().withMessage('Phone cannot be empty.')
            .isNumeric().withMessage('Phone must contain only numbers.')
            .isLength({ min: 10, max: 11 }).withMessage('Phone must be 10 or 11 digits long.')
            .custom(async (phone) => {
                const existingAccount = await UserService.getUserByPhone(phone);
                if (existingAccount) {
                    throw new Error('Phone number already exists.');
                }
            }),

        check('email')
            .matches(/^\w+([\.-]?\w+)*@gmail\.com$/).withMessage('Incorrect gmail format')
            .custom(async (email) => {
                const existingAccount = await UserService.getUserByEmail(email);
                if (existingAccount) {
                    throw new Error('Email already exists.');
                }
            }),

        validate,

        async (req, res, next) => {
            try {
                const { roleId, fullName, gender, nationalId, phone, email } = req.body;
                const userData = { roleId, fullName, gender, nationalId, phone, email };

                userData.password = await bcrypt.hash(userData.phone, 10);
                const newUser = await UserService.createUser(userData);

                if (newUser) {
                    const token = jwt.generateActiveToken(newUser.id);
                    const link = `${domain}/active?token=${token}`;

                    const mailContent = {
                        type: 'active',
                        fullName: newUser.fullName,
                        gender: newUser.gender,
                        email: newUser.email,
                        phone: newUser.phone,
                        link: link
                    }

                    await sendToQueue('send_email', JSON.stringify(mailContent));
                    return res.status(201).json({
                            success: true,
                            message: "Register successfull!",
                            data: {user: {roleId, fullName, gender, nationalId, phone, email}}
                        });
                }
            } catch (error) {
                console.log(error.message);
                next(error);
            }
        }
    ]


    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = { email, password };

            const user = await UserService.getUserByEmail(userData.email)
            if (!user || !bcrypt.compareSync(userData.password, user.password)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid username or password!',
                    data: {}
                });
            }
            if (!user.active) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Account has not been activated!',
                    data: {}
                });
            }

            const token = await generateJWT(user, 'login');
            const refreshToken = await generateRefreshToken(user);

            await UserService.updateUser({ id: user.id, refreshToken: refreshToken });

            return res.status(200).json({ 
                success: true,
                message: 'Login successfull!',
                data: {
                    user,
                    token: token,
                    refreshToken: refreshToken
                }
            })
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            const token = await extractToken(req);

            if (!token) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Token missing',
                    data: {}
                });
            }

            let decodedToken;
            try {
                decodedToken = await decodeToken(token);
            } catch (err) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid token',
                    data: {}
                });
            }
            const userId = decodedToken.id;
            await UserService.deleteUserRefreshToken(userId);
            await revokedTokens.add(token);

            return res.status(200).json({ 
                success: true,
                msg: 'Logout successfull!',
                data: {}
            });

        } catch (error) {
            next(error);
        }
    }

    static async verifyAccount(req, res, next) {
        try {
            const token = extractToken(req);
            if (!token) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Token is missing', 
                    data: {}
                });
            }

            let decodedToken;
            try {
                decodedToken = await decodeToken(token);
            } catch (err) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid token',
                    data: {}
                });
            }

            const userId = decodedToken.id;
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User not found!',
                    data: {}
                });
            }

            await UserService.updateUser({ id: userId, active: true });

            return res.status(200).json({ 
                success: true,
                message: 'Account verified successfully!',
                data: {}
            });
        } catch (error) {
            next(error)
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { email } = req.body;
            const userData = await UserService.getUserByEmail(email);

            if (userData) {
                const newPassword = generatePassword.generate({
                    length: 10,
                    numbers: true
                });

                const hashNewPassword = await bcrypt.hash(newPassword, 10);

                await UserService.updateUser({ email: email, password: hashNewPassword });

                const mailContent = {
                    type: 'resetpassword',
                    fullName: userData.fullName,
                    gender: userData.gender,
                    email: userData.email,
                    password: newPassword
                }

                await sendToQueue('send_email', JSON.stringify(mailContent));
                return res.status(200).json({ 
                    success: true,
                    msg: 'Reset password successfull!',
                    data: {}
                });
            }
            else {
                res.status(404).json({ 
                    success: false,
                    error: 'Email not found!', 
                    data: {}
                });
            }

        } catch (error) {
            next(error);
        }
    }

    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Refresh token is required!', 
                    data: {}
                });
            }

            const user = await UserService.getUserByRefreshToken(refreshToken);
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid refresh token!',
                    data: {}
                });
            }

            await revokedTokens.add(user.refreshToken);

            const accessTokenNew = await generateJWT(user, 'login');
            const refreshTokenNew = await generateRefreshToken(user);

            await UserService.updateUser({ id: user.id, refreshToken: refreshTokenNew });

            return res.status(201).json({
                success: true,
                message: 'Refresh Token sucessfull!',
                data: {accessTokenNew: accessTokenNew,refreshTokenNew: refreshTokenNew}
            });
        } catch (error) {
            next(error);
        }
    }

    static async resendMailActive(req, res, next) {
        try {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User ID is required!',
                    data: {}
                });
            }

            const existingUser = await UserService.getUserById(id);

            if (!existingUser) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User does not exist!',
                    data: {}
                });
            }

            const token = jwt.generateActiveToken(existingUser.id);
            const link = `${domain}/active?token=${token}`;

            const mailContent = {
                type: 'active',
                fullName: existingUser.fullName,
                gender: existingUser.gender,
                email: existingUser.email,
                phone: existingUser.phone,
                link: link
            }
            await sendToQueue('send_email', JSON.stringify(mailContent));
            return res.status(200).json({ 
                success: true,
                msg: 'Complete resend email active!', 
                data: {}
            });

        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword, confirmnNewPassword } = req.body;

            if (newPassword != confirmnNewPassword) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Confirm password does not match!', 
                    data: {}
                });
            }

            const user = await UserService.getUserById(id);
            console.log(user);

            const newPasswordHashed = await bcrypt.hash(newPassword, 10);

            if (!user) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User not found!', 
                    data: {}
                });
            }
            await UserService.updateUser({ id: user.id, password: newPasswordHashed });
            res.status(200).json({ 
                success: true,
                message: 'Change password successfull!', 
                data: {}
            });
        } catch (error) {
            next(error);
        }
    }

    //CRUD of user
    static async getUser(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const user = await UserService.getUserById(id);
                if (user) {
                    return res.status(200).json({
                        success: true,
                        message: 'Get user sucessfull!',
                        data: user
                    });
                } else {
                    return res.status(404).json({ 
                        success: false,
                        message: 'User not found!',
                        data: {}
                    });
                }
            } else {
                const users = await UserService.getAllUsers();
                return res.status(200).json({
                    success: true,
                    message: 'Get all user successfull!',
                    data:  users
                });
            }
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { roleId, fullName, gender, nationalId, phone, email, password } = req.body;

            const updatedUser = await UserService.updateUser({id, roleId, fullName, gender, nationalId, phone, email, password: await bcrypt.hash(password, 10)});
            if (updatedUser) {
                res.status(200).json({
                    success: true,
                    message: 'Update user sucessfull!',
                    data: {id, roleId, fullName, gender, nationalId, phone, email}
                });
            } else {
                res.status(404).json({ 
                    success: false,
                    error: 'User not found!',
                    data: {} 
                });
            }
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const deletedUser = await UserService.deleteUser(id);
            if (deletedUser) {
                res.status(200).json({
                    success: true,
                    message: 'Delete user sucessfull!',
                    data: {deletedUser}
                });
            } else {
                res.status(404).json({ 
                    success: false,
                    error: 'User not found!', 
                    data: {}
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;