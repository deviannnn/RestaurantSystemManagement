const UserService = require('../services/user.service');
const { sendEmail } = require('../utils/send-mail');
const { generateJWT } = require('../utils/jwt');
const bcrypt = require('bcrypt');

class UserController {
    static async register(req, res) {
        const { roleId, fullName, gender, nationalId, phone, email } = req.body;
        const userData = { roleId, fullName, gender, nationalId, phone, email };
        try {
            const find = await UserService.getUserByEmail(userData.email)
            if(find){
                return res.status(400).json({ message: 'User already exists' });
            }

            userData.password = await bcrypt.hash(userData.phone, 10);

            const newUser = await UserService.createUser(userData);

            if(newUser){
                await UserService.sendemailverifyAccount(newUser);
                return res.status(201).json({ msg: 'Complete register!' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Get all users or get user by ID
    static async getUser(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const user = await UserService.getUserById(id);
                if (user) {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            } else {
                const users = await UserService.getAllUsers();
                res.status(200).json(users);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { roleId, fullName, gender, nationalId, phone, email, password } = req.body;
            const updatedUser = await UserService.updateUser(id, roleId, fullName, gender, nationalId, phone, email, password);
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ error: 'Role not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await UserService.deleteUser(id);
            if (deletedUser) {
                res.status(200).json(deletedUser);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;
        const userData = { email, password };
        try {
            const user = await UserService.getUserByEmail(userData.email)
            if (!user || !bcrypt.compareSync(userData.password, user.password)) {
                return res.status(400).json({ message: 'User Invalid email or password!' });
            }
            // Generate a token (implementation depends on your authentication strategy)
            const token = generateJWT(user);
            res.status(201).json({ msg: 'Complete login!' });
            return token;
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async logout(req, res) {
        try {
            res.status(200).json({ msg: 'logout' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async verifyAccount(req, res) {
        const token = req.body.token;
        try {
            res.status(200).json({ msg: 'verifyAccount' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = UserController;