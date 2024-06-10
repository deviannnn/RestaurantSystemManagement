const db = require('../models/index'); // Assuming you have a User model

class UserService {
    async register(userData) {
        const newUser = new User(userData);
        await newUser.save();
        return newUser;
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user || !user.comparePassword(password)) {
            throw new Error('Invalid email or password');
        }
        // Generate a token (implementation depends on your authentication strategy)
        const token = generateToken(user);
        return token;
    }

    async logout(token) {
        // Invalidate the token (implementation depends on your token strategy)
        await invalidateToken(token);
    }

    async verifyAccount(token) {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            throw new Error('Invalid token');
        }
        user.isVerified = true;
        await user.save();
    }
}

module.exports = new UserService();