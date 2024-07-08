const { Role } = require('../models');

module.exports = {
    async createRole(name, active) {
        try {
            return Role.create({ name, active })
            .then((newRole) => newRole.get({ plain: true }));
        } catch (error) {
            console.error('Error create role:', error);
            throw error;
        }
    },

    async getRoleById(id) {
        try {
            return Role.findByPk(id);
        } catch (error) {
            console.error('Error get role by Id:', error);
            throw error;
        }
    },

    async getAllRoles() {
        try {
            return Role.findAll();
        } catch (error) {
            console.error('Error get all roles:', error);
            throw error;
        }
    },

    async updateRole(id, name, active) {
        try {
            const [updated] = await Role.update({ name, active }, { where: { id } });
            if (updated) {
                return Role.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error update roles:', error);
            throw error;
        }
    },

    async deleteRole(id) {
        try {
            const role = await Role.findByPk(id);
            if (role) {
                await Role.destroy({ where: { id } });
                return role;
            }
            return null;
        } catch (error) {
            console.error('Error delete roles:', error);
            throw error;
        }
    }
};