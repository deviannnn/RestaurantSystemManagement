const RoleService = require('../services/role.service');

class RoleController {
    // Create a new role
    static async createRole(req, res) {
        try {
            const { name, active } = req.body;
            const newRole = await RoleService.createRole(name, active);
            res.status(201).json(newRole);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all roles or get role by ID
    static async getRoles(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const role = await RoleService.getRoleById(id);
                if (role) {
                    res.status(200).json(role);
                } else {
                    res.status(404).json({ error: 'Role not found' });
                }
            } else {
                const roles = await RoleService.getAllRoles();
                res.status(200).json(roles);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update role by ID
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name, active } = req.body;
            const updatedRole = await RoleService.updateRole(id, name, active);
            if (updatedRole) {
                res.status(200).json(updatedRole);
            } else {
                res.status(404).json({ error: 'Role not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete role by ID
    static async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const deletedRole = await RoleService.deleteRole(id);
            if (deletedRole) {
                res.status(200).json(deletedRole);
            } else {
                res.status(404).json({ error: 'Role not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RoleController;