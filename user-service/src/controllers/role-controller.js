const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const { RoleService } = require('../services');

module.exports = {
    /** Expected Input
     * 
     * { name, active } = req.body
     * 
     */
    createRole: [
        inputChecker.checkBodyCreateRole,
        async (req, res, next) => {
            try {
                const { name, active } = req.body;

                const newRole = await RoleService.createRole(name, active);
                res.status(201).json({
                    success: true,
                    message: 'Create role successfully!',
                    data: { role: newRole }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * { roleId } = req.params
     * 
     */
    async getRoles(req, res, next) {
        try {
            const { roleId } = req.params;
            if (roleId) {
                const role = await RoleService.getRoleById(roleId);
                if (!role) return next(createError(404, 'Role not found'));
                res.status(200).json({
                    success: true,
                    message: 'Get role successfully!',
                    data: { role }
                });
            } else {
                const roles = await RoleService.getAllRoles();
                res.status(200).json({
                    sucess: true,
                    message: 'Get all roles successfully!',
                    data: { roles }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * { roleId } = req.params
     * { name, active } = req.body
     * 
     */
    updateRole: [
        inputChecker.checkBodyUpdateRole,
        async (req, res, next) => {
            try {
                const { roleId } = req.params;
                const { name, active } = req.body;

                const updatedRole = await RoleService.updateRole({ id: roleId, name, active });
                if (!updatedRole) return next(createError(404, 'Role not found'));

                res.status(200).json({
                    success: true,
                    message: 'Update role successfully!',
                    data: { role: updatedRole }
                });
            } catch (error) {
                return next(error);
            }
        },
    ],

    /** Expected Input
     * 
     * { roleId } = req.params
     * 
     */
    async deleteRole(req, res, next) {
        try {
            const { roleId } = req.params;

            const deletedRole = await RoleService.deleteRole(roleId);
            if (!deletedRole) return next(createError(404, 'Role not found'));

            res.status(200).json({
                success: true,
                message: 'Delete role sucessfully!',
                data: { role: deletedRole }
            });
        } catch (error) {
            return next(error);
        }
    }
};