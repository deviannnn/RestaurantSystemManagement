require('dotenv').config();
const { User } = require('../models'); // Assuming you have a User model
const { generateJWT } = require('../utils/jwt');
const generateVerificationEmail = require('../utils/mail-template');
const { revokedTokens } = require('../middlewares/auth')
const amqp = require('amqplib');

class UserService {
    static async createUser(userData) {
        try {
            const newUser = (await User.create(userData)).get({ plain: true });
            return newUser;
        } catch (error) {
            throw new Error('Error register');
        }
    }

    static async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    static async getUserById(id) {
        return User.findByPk(id);
    }

    static async getAllUsers() {
        return User.findAll();
    }

    static async updateUser(id, roleId, fullName, gender, nationalId, phone, email) {
        const [updated] = await User.update({ roleId, fullName, gender, nationalId, phone, email }, { where: { id } });
        if (updated) {
            return User.findByPk(id);
        }
        return null;
    }

    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (user) {
            await User.destroy({ where: { id } });
            return user;
        }
        return null;
    }

    static async logout(token) {
        try {
            // Invalidate the token (implementation depends on your token strategy)
            await revokedTokens.add(token);
        } catch (error) {
            throw new Error('Error logout');
        }
    }

    static async verifyAccount(token) {
        try {
            const user = await User.findOne({ verificationToken: token });
            if (!user) {
                throw new Error('Invalid token');
            }
            user.isVerified = true;
            await user.save();
        } catch (error) {
            throw new Error('Error verifyaAccount');
        }
    }
}

module.exports = UserService;