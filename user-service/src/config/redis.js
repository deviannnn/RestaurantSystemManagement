const redis = require('redis');

class RedisConnection {
    constructor() {
        this.redisUrl = 'redis://localhost:6379';
        this.client = null;
    }

    async connect() {
        if (!this.client) {
            this.client = redis.createClient({
                url: this.redisUrl
            });

            return new Promise((resolve, reject) => {
                this.client.on('error', (err) => {
                    console.error('Redis connection error:', err);
                    this.client = null;
                    reject(err);
                });

                this.client.on('ready', () => {
                    console.log('Connected to Redis');
                    resolve();
                });

                this.client.connect().catch((err) => {
                    console.error('Redis connection failed:', err);
                    this.client = null;
                    reject(err);
                });
            });
        } else if (!this.client.isOpen) {
            // Reconnect if client is not open
            return this.client.connect();
        }
    }

    async saveToRedis(key, value, expireTimeInSeconds) {
        try {
            await this.connect();

            if (this.client && this.client.isOpen) {
                // await this.client.set(key, value, 'EX', expireTimeInSeconds);
                await this.client.set(key, value, {EX: expireTimeInSeconds});
            } else {
                throw new Error('Redis client is not connected.');
            }
        } catch (error) {
            console.error(`Error saving ${key} to Redis:`, error);
            throw error;
        }
    }

    async getFromRedis(key) {
        try {
            await this.connect();

            if (this.client && this.client.isOpen) {
                const value = await this.client.get(key);
                return value;
            } else {
                throw new Error('Redis client is not connected.');
            }
        } catch (error) {
            console.error(`Error getting ${key} from Redis:`, error);
            throw error;
        }
    }

    async deleteFromRedis(key) {
        try {
            await this.connect();

            if (this.client && this.client.isOpen) {
                await this.client.del(key);
                console.log(`Deleted key ${key} from Redis`);
            } else {
                throw new Error('Redis client is not connected.');
            }
        } catch (error) {
            console.error(`Error deleting ${key} from Redis:`, error);
            throw error;
        }
    }

    async closeConnection() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            console.log('Redis connection closed');
        }
    }
}

module.exports = new RedisConnection();
