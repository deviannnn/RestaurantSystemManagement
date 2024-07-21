const { Role, User } = require('../models');

module.exports = {
    async createRole(name, active) {
        try {
            const newRole = await Role.create({ name, active });
            return newRole;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    },

    async getRoleById(id) {
        try {
            return await Role.findByPk(id, {
                include: [{ model: User, as: 'users' }]
            });
        } catch (error) {
            console.error('Error getting role by Id:', error);
            throw error;
        }
    },

    async getAllRoles() {
        try {
            return await Role.findAll({
                include: [{ model: User, as: 'users' }]
            });
        } catch (error) {
            console.error('Error getting all roles:', error);
            throw error;
        }
    },

    async updateRole({ id, name, active }) {
        try {
            const [updated] = await Role.update({ name, active }, { where: { id } });
            if (updated) {
                return Role.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating role:', error);
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
            console.error('Error deleting role:', error);
            throw error;
        }
    }
};