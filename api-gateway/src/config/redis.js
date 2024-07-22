const redis = require('redis');

class RedisConnection {
    constructor() {
        this.redisUrl = 'redis://localhost:6379';
        this.client = null;
    }

    async connect() {
        if (!this.client) {
            this.client = redis.createClient({ url: this.redisUrl });

            try {
                await this.client.connect();
            } catch (error) {
                this.client = null;
                throw error;
            }

            this.client.on('error', (err) => {
                console.error('Redis connection error:', err);
            });
        }
    }

    async saveToRedis(key, value, expireTimeInSeconds) {
        try {
            if (!this.client || !this.client.isOpen) await this.connect();

            await this.client.set(key, JSON.stringify(value), { EX: expireTimeInSeconds });
        } catch (error) {
            console.error(`Error saving ${key} to Redis:`, error);
            throw error;
        }
    }

    async getFromRedis(key) {
        try {
            if (!this.client || !this.client.isOpen) await this.connect();

            const value = await this.client.get(key) || null;
            return JSON.parse(value);
        } catch (error) {
            console.error(`Error getting ${key} from Redis:`, error);
            throw error;
        }
    }

    async deleteFromRedis(key) {
        try {
            if (!this.client || !this.client.isOpen) await this.connect();

            await this.client.del(key);
        } catch (error) {
            console.error(`Error deleting ${key} from Redis:`, error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client && this.client.isOpen) {
            try {
                await this.client.quit();
                this.client = null;
                console.log('Disconnected from Redis');
            } catch (error) {
                console.error('Error disconnecting from Redis:', error);
                throw error;
            }
        }
    }
}

module.exports = new RedisConnection();