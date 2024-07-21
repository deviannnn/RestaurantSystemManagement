const Redis = require('../config/redis');

module.exports = {
    async saveCacheData({ key, value, expireTimeInSeconds }) {
        try {
            await Redis.saveToRedis(key, value, expireTimeInSeconds);
        } catch (error) {
            throw error;
        }
    },
    
    async getCacheData(key) {
        try {
            return await Redis.getFromRedis(key);
        } catch (error) {
            throw error;
        }
    },

    async deleteCacheData(key) {
        try {
            return await Redis.deleteFromRedis(key);
        } catch (error) {
            throw error;
        }
    }
};