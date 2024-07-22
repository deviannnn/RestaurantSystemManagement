const createError = require('http-errors');
const { check, body } = require('express-validator');
const validator = require('./vaildator');

const { UserService, RoleService, RabbitMQ, RedisService } = require('../services');

module.exports = {
    checkBodyCreateRole: [
        body('name')
            .trim()
            .notEmpty().withMessage('Role\'s Name is required')
            .isString().withMessage('Role\'s Name must be a string'),
        body('active')
            .optional()
            .trim()
            .notEmpty().withMessage('Role\'s Active status is required')
            .isBoolean().withMessage('Role\'s Active status must be a boolean'),
        validator
    ],

    checkBodyUpdateRole: [
        body('name')
            .optional()
            .trim()
            .notEmpty().withMessage('Role\'s Name is required')
            .isString().withMessage('Role\'s Name must be a string'),
        body('active')
            .optional()
            .trim()
            .notEmpty().withMessage('Role\'s Active status is required')
            .isBoolean().withMessage('Role\'s Active status must be a boolean'),
        validator
    ],

    // .matches(/^[\w.+\-]+@gmail\.com$/).withMessage('User\'s Gmail must be a valid gmail address')
    checkBodyRegisterUser: [
        body('fullName')
            .trim()
            .notEmpty().withMessage('User\'s Fullname is required')
            .matches(/^[\p{L}\s]*$/u).withMessage('User\'s Fullname should only contain letters and spaces'),
        body('gender')
            .trim()
            .notEmpty().withMessage('User\'s Gender is required')
            .isBoolean().withMessage('User\'s Gender must be a boolean'),
        body('nationalId')
            .trim()
            .notEmpty().withMessage('User\'s NationalID is required')
            .isLength({ min: 12, max: 12 }).withMessage('User\'s NationalID must be 12 digits long')
            .custom(async (value) => {
                const existed = await UserService.getUserByNationalId(value);
                if (existed) throw new Error('A user already exists with this NationalID');
                return true;
            }),
        body('phone')
            .trim()
            .notEmpty().withMessage('User\'s PhoneNumber is required')
            .isMobilePhone('vi-VN').withMessage('User\'s PhoneNumber is incorrectly formatted')
            .custom(async (value) => {
                const existed = await UserService.getUserByPhone(value);
                if (existed) throw new Error('A user already exists with this PhoneNumber');
                return true;
            }),
        body('gmail')
            .trim()
            .notEmpty().withMessage('User\'s Gmail is required')
            .isEmail({ host_whitelist: ['gmail.com'] }).withMessage('User\'s Gmail is incorrectly formatted')
            .custom(async (value) => {
                const existed = await UserService.getUserByGmail(value);
                if (existed) throw new Error('A user already exists with this Gmail');
                return true;
            }),
        validator
    ],

    // .matches(/^[\w.+\-]+@gmail\.com$/).withMessage('User\'s Gmail must be a valid gmail address')
    checkBodyUpdateUser: [
        body('fullName')
            .optional()
            .trim()
            .notEmpty().withMessage('User\'s Fullname is required')
            .matches(/^[\p{L}\s]*$/u).withMessage('User\'s Fullname should only contain letters and spaces'),
        body('gender')
            .optional()
            .trim()
            .notEmpty().withMessage('User\'s Gender is required')
            .isBoolean().withMessage('User\'s Gender must be a boolean'),
        body('nationalId')
            .optional()
            .trim()
            .notEmpty().withMessage('User\'s NationalID is required')
            .isLength({ min: 12, max: 12 }).withMessage('User\'s NationalID must be 12 digits long')
            .custom(async (value, { req }) => {
                const existed = await UserService.getUserByNationalId(value);
                if (existed && req.params.userId !== existed.id) throw new Error('A user already exists with this NationalID');
                return true;
            }),
        body('phone')
            .optional()
            .trim()
            .notEmpty().withMessage('User\'s PhoneNumber is required')
            .isMobilePhone('vi-VN').withMessage('User\'s PhoneNumber is incorrectly formatted')
            .custom(async (value, { req }) => {
                const existed = await UserService.getUserByPhone(value);
                if (existed && req.params.userId !== existed.id) throw new Error('A user already exists with this PhoneNumber');
                return true;
            }),
        body('gmail')
            .optional()
            .trim()
            .notEmpty().withMessage('User\'s Gmail is required')
            .isEmail({ host_whitelist: ['gmail.com'] }).withMessage('User\'s Gmail is incorrectly formatted')
            .custom(async (value, { req }) => {
                const existed = await UserService.getUserByGmail(value);
                if (existed && req.params.userId !== existed.id) throw new Error('A user already exists with this Gmail');
                return true;
            }),
        validator
    ],

    checkBodyRole: [
        body('roleId').trim().notEmpty().withMessage('Role ID is required'),
        validator
    ],

    checkRoleExist: async (req, res, next) => {
        const roleId = req.body.roleId;

        if (!roleId) return next();

        try {
            const roleData = await RoleService.getRoleById(roleId, false);
            if (!roleData) return next(createError(404, 'Role not found'));

            req.role = roleData;
            return next();
        } catch (error) {
            return next(error);
        }
    },

    checkBodyRefreshToken: [
        body('refreshToken')
            .trim()
            .notEmpty().withMessage('RefreshToken is required')
            .isString().withMessage('RefreshToken must be a string'),
        validator
    ],

    checkBodyChangePassword: [
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword')
            .trim()
            .notEmpty().withMessage('Confirm password is required')
            .isString().withMessage('Confirm password must be a string')
            .custom((value, { req }) => {
                if (value !== req.body.password) throw new Error('Password confirmation does not match password');
                return true;
            }),
        validator
    ],

    checkBodyLogin: [
        body('gmail')
            .trim()
            .notEmpty().withMessage('User\'s Gmail is required')
            .isEmail({ host_whitelist: ['gmail.com'] }).withMessage('User\'s Gmail is incorrectly formatted'),
        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string'),
        validator
    ]
};