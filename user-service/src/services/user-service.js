require('dotenv').config();
const { User } = require('../models'); // Assuming you have a User model

module.exports = {
    async createUser({ roleId, fullName, gender, nationalId, phone, gmail, password }) {
        try {
            const newUser = await User.create({ roleId, fullName, gender, nationalId, phone, gmail, password });
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async getUserByGmail(gmail) {
        try {
            return await User.findOne({ where: { gmail } });
        } catch (error) {
            console.error('Error get user by gmail:', error);
            throw error;
        }
    },

    async getUserByNationalId(nationalId) {
        try {
            return await User.findOne({ where: { nationalId } });
        } catch (error) {
            console.error('Error get user by national Id:', error);
            throw error;
        }
    },

    async getUserByPhone(phone) {
        try {
            return await User.findOne({ where: { phone } });
        } catch (error) {
            console.error('Error get user by phone:', error);
            throw error;
        }
    },

    async getUserById(id) {
        try {
            return await User.findByPk(id);
        } catch (error) {
            console.error('Error getting user by Id:', error);
            throw error;
        }
    },

    async getAllUsers() {
        try {
            return await User.findAll();
        } catch (error) {
            console.error('Error get all users:', error);
            throw error;
        }
    },

    async updateUser({ id, roleId, fullName, gender, nationalId, phone, gmail, password, active, refreshToken }) {
        try {
            const [updated] = await User.update({ roleId, fullName, gender, nationalId, phone, gmail, password, active, refreshToken }, { where: { id } });
            if (updated) {
                return User.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async deleteUserRefreshToken(id) {
        try {
            return await User.update({ refreshToken: null }, { where: { id } });
        } catch (error) {
            console.error('Error delete user refreshtoken:', error);
            throw error;
        }
    },

    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (user) {
                await User.destroy({ where: { id } });
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};