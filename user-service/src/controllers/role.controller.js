const createError = require('http-errors');
const { RoleService } = require('../services');

const { validationResult, check } = require('express-validator');

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({ field: error.path, msg: error.msg }));
        return res.status(400).json({ success: false, message: errorMessages, data: {} });
    }
    next();
}

module.exports = {
    // Create a new role
    createRole: [
        check('name')
            .notEmpty().withMessage('Name is required')
            .isString().withMessage('Name must be a string'),
        check('active')
            .notEmpty().withMessage('Active status is required')
            .isBoolean().withMessage('Active must be a boolean'),
        validate,
        async (req, res, next) => {
            try {
                const { name, active } = req.body;
                const newRole = await RoleService.createRole(name, active);
                res.status(201).json({
                    success: true,
                    message: 'Create role successfull!',
                    data: { newRole }
                });
            } catch (error) {
                next(error);
            }
        }
    ],

    // Get all roles or get role by ID
    async getRoles(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const role = await RoleService.getRoleById(id);
                if (role) {
                    res.status(200).json({
                        success: true,
                        message: 'Get role successfull!',
                        data: {}
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        error: 'Role not found!',
                        data: {}
                    });
                }
            } else {
                const roles = await RoleService.getAllRoles();
                res.status(200).json(roles);
            }
        } catch (error) {
            next(error);
        }
    },

    // Update role by ID
    updateRole: [
        check('name')
            .notEmpty().withMessage('Name is required')
            .isString().withMessage('Name must be a string'),
        check('active')
            .notEmpty().withMessage('Active status is required')
            .isBoolean().withMessage('Active must be a boolean'),
        validate,
        async (req, res, next) => {
            try {
                const { id } = req.params;
                const { name, active } = req.body;
                const updatedRole = await RoleService.updateRole(id, name, active);
                if (updatedRole) {
                    res.status(200).json({
                        success: true,
                        message: 'Update role successfull!',
                        data: { updatedRole }
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Role not found!',
                        data: {}
                    });
                }
            } catch (error) {
                next(error);
            }
        },
    ],

    // Delete role by ID
    async deleteRole(req, res, next) {
        try {
            const { id } = req.params;
            const deletedRole = await RoleService.deleteRole(id);
            if (deletedRole) {
                res.status(200).json({
                    success: false,
                    message: 'Delete role sucessfull!',
                    data: {}
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Role not found!',
                    data: {}
                });
            }
        } catch (error) {
            next(error);
        }
    }
};