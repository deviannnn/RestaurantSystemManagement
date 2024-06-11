const { Role } = require('../models');

class RoleService {
    static async createRole(name, active) {
        return Role.create({ name, active })
            .then((newRole) => newRole.get({ plain: true }));
    }

    static async getRoleById(id) {
        return Role.findByPk(id);
    }

    static async getAllRoles() {
        return Role.findAll();
    }

    static async updateRole(id, name, active) {
        const [updated] = await Role.update({ name, active }, { where: { id } });
        if (updated) {
            return Role.findByPk(id);
        }
        return null;
    }

    static async deleteRole(id) {
        const role = await Role.findByPk(id);
        if (role) {
            await Role.destroy({ where: { id } });
            return role;
        }
        return null;
    }
}

module.exports = RoleService;