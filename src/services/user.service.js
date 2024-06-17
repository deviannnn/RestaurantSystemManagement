require('dotenv').config();
const {User} = require('../models'); // Assuming you have a User model
const { generateJWT } = require('../utils/jwt');
const generateVerificationEmail = require('../utils/emailTemplate');
const { revokedTokens } = require('../middlewares/auth')
const amqp = require('amqplib');
const bcrypt = require('bcrypt');

class UserService {
    static async createUser(userData) {
        try {
            const newUser = (await User.create(userData)).get({ plain: true });
            return newUser;
        } catch (error) {
            throw new Error('Error register');
        }
    }

    static async getUserByRefreshToken(refreshToken) {
        return await User.findOne({ where: { refreshToken } });
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

    static async updateUserRefreshToken(id, refreshToken) {
        return await User.update({ refreshToken }, { where: { id } });
    }

    static async deleteUserRefreshToken(id) {
        return await User.update({ refreshToken: null }, { where: { id } });
    }

    static async deleteUser(id){
        const user = await User.findByPk(id);
        if (user) {
            await User.destroy({ where: { id } });
            return user;
        }
        return null;
    }

    // static async logout(token) {
    //     try {
    //         // Invalidate the token (implementation depends on your token strategy)
    //         await revokedTokens.add(token);
    //     } catch (error) {
    //         throw new Error('Error logout');
    //     }
    // }

    // static async verifyAccount(token) {
    //     try {
    //         const user = await User.findOne({ verificationToken: token });
    //         if (!user) {
    //             throw new Error('Invalid token');
    //         }
    //         user.isVerified = true;
    //         await user.save();
    //     } catch (error) {
    //         throw new Error('Error verifyaAccount');
    //     }
    // }

    static async sendemailverifyAccount(newUser) {
        try {
            const hostName = process.env.HOST_NAME;
            const port = process.env.PORT;
            const domain = `http://${hostName}:${port}`;

            const token = await generateJWT(newUser, 'password_change');
            console.log('generateJWT...');

            const link = `${domain}/active?token=${token}`
            const email = newUser.email;
            const mailSubject = 'Account successfully created';
            const mailHtml = generateVerificationEmail(newUser, link);

            const message = { email, mailSubject, mailHtml };

            console.log('Connecting to RabbitMQ...');
            // Kết nối tới RabbitMQ trong Docker
            const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
            const channel = await connection.createChannel();
            const queue = 'email_queue';

            // Đảm bảo hàng đợi tồn tại
            await channel.assertQueue(queue, { durable: false });

            // Gửi tin nhắn vào hàng đợi
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

            // Đóng kết nối
            setTimeout(() => {
                connection.close();
            }, 500);
        } catch (error) {
            console.log(error.message);
            throw new Error('Error send email verifyaAccount');
        }
    }
}

module.exports = UserService;