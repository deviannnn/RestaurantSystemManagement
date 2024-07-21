require('dotenv').config();
const { User } = require('../models'); // Assuming you have a User model

module.exports = {
    async createUser(userData) {
        try {
            const newUser = (await User.create(userData)).get({ plain: true });
            return newUser;
        } catch (error) {
            console.error('Error create user:', error);
            throw error;
        }
    },

    async getUserByRefreshToken(refreshToken) {
        try {
            return await User.findOne({ where: { refreshToken } });
        } catch (error) {
            console.error('Error get user by refreshtoken', error);
            throw error;
        }
    },

    async getUserByEmail(email) {
        try {   
            return await User.findOne({ where: { email } });
        } catch (error) {
            console.error('Error get user by email:', error);
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
            return User.findByPk(id);
        } catch (error) {
            console.error('Error get user by Id:', error);
            throw error;
        }    
    },

    async getAllUsers() {
        try {
            return User.findAll();
        } catch (error) {
            console.error('Error get all users:', error);
            throw error;
        }
    },

    async updateUser({id, roleId, fullName, gender, nationalId, phone, email, password, active, refreshToken}) {
        try {
            const [updated] = await User.update({ roleId, fullName, gender, nationalId, phone, email, password, active, refreshToken}, { where: { id } });
            if (updated) {
                return User.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error update user:', error);
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
            console.error('Error delete user:', error);
            throw error;
        }
    }
};