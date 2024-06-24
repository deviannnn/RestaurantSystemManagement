const { Role } = require('../models');

class RoleService {
    static async createRole(name, active) {
        try {
            return Role.create({ name, active })
            .then((newRole) => newRole.get({ plain: true }));
        } catch (error) {
            throw error;
        }
    }

    static async getRoleById(id) {
        try {
            return Role.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    static async getAllRoles() {
        try {
            return Role.findAll();
        } catch (error) {
            throw error;
        }
    }

    static async updateRole(id, name, active) {
        try {
            const [updated] = await Role.update({ name, active }, { where: { id } });
            if (updated) {
                return Role.findByPk(id);
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    static async deleteRole(id) {
        try {
            const role = await Role.findByPk(id);
            if (role) {
                await Role.destroy({ where: { id } });
                return role;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoleService;