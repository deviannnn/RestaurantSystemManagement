const userService = require('../services/user.service');

class UserController {
    async register(req, res) {
        try {
            res.status(201).json({ msg: 'register' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            res.status(200).json({ msg: 'login' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            res.status(200).json({ msg: 'logout' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async verifyAccount(req, res) {
        try {
            res.status(200).json({ msg: 'verifyAccount' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UserController();