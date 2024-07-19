const Redis = require('../config/redis');

module.exports = {
    async saveTokenRevoked({key, value, expireTimeInSeconds}) {
        try {
            await Redis.saveToRedis(key, value, expireTimeInSeconds);
        } catch (error) {
            console.error('Error save token revoked to redis:', error);
            throw error;
        }
    },
    async getTokenRevoked(key) {
        try {
            return await Redis.getFromRedis(key);
        } catch (error) {
            console.error('Error save token revoked to redis:', error);
            throw error;
        }
    }
};