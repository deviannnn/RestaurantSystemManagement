require('dotenv').config();
const { User } = require('../models'); // Assuming you have a User model

class UserService {
    static async createUser(userData) {
        try {
            const newUser = (await User.create(userData)).get({ plain: true });
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    static async getUserByRefreshToken(refreshToken) {
        try {
            return await User.findOne({ where: { refreshToken } });
        } catch (error) {
            throw error;
        }
    }

    static async getUserByEmail(email) {
        try {   
            return await User.findOne({ where: { email } });
        } catch (error) {
            throw error;
        }
    }

    static async getUserByNationalId(nationalId) {
        try {
            return await User.findOne({ where: { nationalId } });
        } catch (error) {
            throw error;
        }   
    }

    static async getUserByPhone(phone) {
        try {
            return await User.findOne({ where: { phone } });
        } catch (error) {
            throw error;
        }
    }

    static async getUserById(id) {
        try {
            return User.findByPk(id);
        } catch (error) {
            throw error;
        }    
    }

    static async getAllUsers() {
        try {
            return User.findAll();
        } catch (error) {
            throw error;
        }
    }

    static async updateUser({id, roleId, fullName, gender, nationalId, phone, email, password, active, refreshToken}) {
        try {
            const [updated] = await User.update({ roleId, fullName, gender, nationalId, phone, email, password, active, refreshToken}, { where: { id } });
            if (updated) {
                return User.findByPk(id);
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    static async deleteUserRefreshToken(id) {
        try {
            return await User.update({ refreshToken: null }, { where: { id } });
        } catch (error) {
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (user) {
                await User.destroy({ where: { id } });
                return user;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;