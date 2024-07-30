const createError = require('http-errors');
const murmurhash = require('murmurhash');
const bcrypt = require('bcrypt');
const randomPassword = require('generate-password');

const jwtUtils = require('../utils/jwt');
const inputChecker = require('../middlewares/input-checker');

const { UserService, RabbitMQService, RedisService } = require('../services');

const SALT_PASSWORD = 10;

const hashToken = (token) => {
    return murmurhash.v3(token).toString(36);
};

module.exports = {
    /** Expected Input
     * 
     * { roleId, fullName, gender, nationalId, phone, gmail } = req.body
     * 
     */
    register: [
        inputChecker.checkBodyRole,
        inputChecker.checkRoleExist,
        inputChecker.checkBodyRegisterUser,
        async (req, res, next) => {
            try {
                const { roleId, fullName, gender, nationalId, phone, gmail } = req.body;

                const password = randomPassword.generate({ length: 10, numbers: true, symbols: true });
                const hashPassword = await bcrypt.hash(password, SALT_PASSWORD);

                const newUser = await UserService.createUser({ roleId, fullName, gender, nationalId, phone, gmail, password: hashPassword });

                const token = jwtUtils.generateToken({ id: newUser.id }, 'active');
                const dataToSend = {
                    type: 'active', fullName, gender, gmail, password,
                    route: `/api/auth/active?token=${token}`
                }
                await RabbitMQService.publishNewMail(dataToSend).catch(err => {
                    console.error('Error publishing On User Registed:', err);
                });

                res.status(201).json({
                    success: true,
                    message: 'Regist User\'s account successfully!',
                    data: { user: newUser }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * userId ? = req.params
     * 
     */
    async getUsers(req, res, next) {
        try {
            const { userId } = req.params;
            if (userId) {
                const user = await UserService.getUserById(userId);
                if (!user) return next(createError(404, 'User\'s account not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get user sucessfully!',
                    data: { user }
                });
            } else {
                const users = await UserService.getAllUsers();
                res.status(200).json({
                    success: true,
                    message: 'Get all user successfully!',
                    data: { users }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * userId = req.params
     * { roleId, fullName, gender, nationalId, phone, gmail } = req.body
     * 
     */
    updateUser: [
        inputChecker.checkBodyUpdateUser,
        inputChecker.checkRoleExist,
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { roleId, fullName, gender, nationalId, phone, gmail } = req.body;

                const updatedUser = await UserService.updateUser({ id: userId, roleId, fullName, gender, nationalId, phone, gmail });
                if (!updatedUser) return next(createError(404, 'User not found'));

                res.status(200).json({
                    success: true,
                    message: 'Update user sucessfully!',
                    data: { user: updatedUser }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * userId = req.params
     * 
     */
    async deleteUser(req, res, next) {
        try {
            const { userId } = req.params;

            const deletedUser = await UserService.deleteUser(userId);
            if (!deletedUser) return next(createError(404, 'User not found'));

            res.status(200).json({
                success: true,
                message: 'Delete user sucessfully!',
                data: { user: deletedUser }
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * token = req.query.token
     * 
     */
    async activateAccount(req, res, next) {
        try {
            const activeToken = jwtUtils.extractToken(req);
            if (!activeToken) return next(createError(401, 'No ActiveToken provided!'));

            let decoded;
            try {
                decoded = jwtUtils.decodeToken(activeToken, 'active');
            } catch (error) {
                return next(createError(401, ''));
            }

            const user = await UserService.getUserById(decoded.id);
            if (!user) return next(createError(404, 'User\'s account not found'));
            if (!user.active) await UserService.updateUser({ id: user.id, active: true });

            return res.status(200).json({
                success: true,
                message: 'User\'s account is already activated!',
                data: {}
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { gmail, password } = req.body
     * 
     */
    login: [
        inputChecker.checkBodyLogin,
        async (req, res, next) => {
            try {
                const { gmail, password } = req.body;

                const user = await UserService.getUserByGmail(gmail);
                if (!user || !bcrypt.compareSync(password, user.password)) return next(createError(400, 'Invalid gmail or password'));
                if (!user.active) return next(createError(400, 'User\'s account has not been activated'));

                const accessToken = jwtUtils.generateToken({ id: user.id, roleId: user.roleId, fullName: user.fullName }, 'access');
                const refreshToken = jwtUtils.generateToken({ id: user.id, roleId: user.roleId }, 'refresh');

                res.status(200).json({
                    success: true,
                    message: 'Login successfully!',
                    data: { accessToken, refreshToken }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * { gmail } = req.body
     * 
     */
    async resetPassword(req, res, next) {
        try {
            const { gmail } = req.body;

            const user = await UserService.getUserByGmail(gmail);
            if (!user) return next(createError(404, 'User\'s account not found'));

            const password = randomPassword.generate({ length: 10, numbers: true, symbols: true });
            const hashPassword = await bcrypt.hash(password, SALT_PASSWORD);

            await UserService.updateUser({ id: user.id, password: hashPassword });

            const dataToSend = {
                type: 'resetpassword',
                fullName: user.fullName,
                gender: user.gender,
                gmail: user.gmail,
                password
            }
            await RabbitMQService.publishNewMail(dataToSend).catch(err => {
                console.error('Error publishing On User Registed:', err);
            });

            res.status(200).json({
                success: true,
                message: 'Reset password successfully!',
                data: {}
            });
        } catch (error) {
            return next(error);
        }
    },


    /** Expected Input
     * 
     * { refreshToken } = req.body
     * 
     */
    refreshToken: [
        inputChecker.checkBodyRefreshToken,
        async (req, res, next) => {
            try {
                const { refreshToken } = req.body;

                const hashedToken = hashToken(refreshToken);

                // check token in cache
                const isRevokedToken = await RedisService.getCacheData(hashedToken);
                if (isRevokedToken) return next(createError(401, 'Token has been revoked!'));

                let decoded;
                try {
                    decoded = jwtUtils.decodeToken(refreshToken, 'refresh');
                } catch (error) {
                    return next(createError(401, ''));
                }

                const user = await UserService.getUserById(decoded.id);
                if (!user) return next(createError(404, 'User\'s account not found'));

                // Calculate the remaining time of the refresh token
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                const remainingTime = decoded.exp - currentTime;

                // add token in cache
                await RedisService.saveCacheData({ key: hashedToken, value: true, expireTimeInSeconds: remainingTime });

                const newAccessToken = jwtUtils.generateToken({ id: user.id, roleId: user.roleId, fullName: user.fullName }, 'access');
                const newRefreshToken = jwtUtils.generateToken({ id: user.id, roleId: user.roleId }, 'refresh', `${remainingTime}s`);

                res.status(201).json({
                    success: true,
                    message: 'Get new tokens successfully!',
                    data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    async logout(req, res, next) {
        try {
            // Calculate the remaining time of the refresh token
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const remainingTime = req.user.exp - currentTime;

            // add token in cache
            const hashedToken = hashToken(jwtUtils.extractToken(req));
            await RedisService.saveCacheData({ key: hashedToken, value: true, expireTimeInSeconds: remainingTime });

            res.status(200).json({
                success: true,
                message: 'Logout successfully!',
                data: {}
            });
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { password, confirmPassword } = req.body
     * 
     */
    changePassword: [
        inputChecker.checkBodyChangePassword,
        async (req, res, next) => {
            try {
                const hashPassword = await bcrypt.hash(req.body.password, SALT_PASSWORD);

                const user = await UserService.updateUser({ id: req.user.id, password: hashPassword });
                if (!user) return next(createError(404, 'User\'s account not found'));

                res.status(200).json({
                    success: true,
                    message: 'Change password successfully!',
                    data: { user }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * userId  = req.params
     * 
     */
    async resendMailActive(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await UserService.getUserById(userId);
            if (!user) return next(createError(404, 'User\'s account not found'));
            if (user.active) return next(createError(400, 'User\'s account already has been activated'));

            const token = jwtUtils.generateToken({ id: newUser.id }, 'active');
            const dataToSend = {
                type: 'active',
                fullName: user.fullName,
                gender: user.gender,
                gmail: user.gmail,
                phone: user.phone,
                route: `/auth/active?token=${token}`
            }
            await RabbitMQService.publishNewMail(dataToSend).catch(err => {
                console.error('Error publishing On User Registed:', err);
            });

            res.status(200).json({
                success: true,
                message: 'Send active mail successfully!',
                data: {}
            });

        } catch (error) {
            return next(error);
        }
    },
};