const Redis = require('../config/redis');

module.exports = {
    async saveItemsForClient({key, value, expireTimeInSeconds}) {
        try {
            await Redis.saveToRedis(key, value, expireTimeInSeconds);
        } catch (error) {
            console.error('Error save token revoked to redis:', error);
            throw error;
        }
    },
    async getItemsToRedis(key) {
        try {
            return await Redis.getFromRedis(key);
        } catch (error) {
            console.error('Error get token revoked from redis:', error);
            throw error;
        }
    },

    async delItemsToRedis(key) {
        try {
            return await Redis.deleteFromRedis(key);
        } catch (error) {
            console.error('Error delete items from redis:', error);
            throw error;
        }
    }
};