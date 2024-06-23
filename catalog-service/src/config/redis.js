const redis = require('redis');

const REDIS_URL = 'redis://localhost:6379';

const connectRedis = async () => {
    const client = redis.createClient({
        url: REDIS_URL
    });
    
    return new Promise((resolve, reject) => {
        client.on('error', (err) => {
            console.error('Redis connection error:', err);
            reject(err);
        });

        client.on('ready', () => {
            console.log('Connected to Redis');
            resolve(client);
        });

        client.connect().catch((err) => {
            console.error('Redis connection failed:', err);
            reject(err);
        });
    });
};

module.exports = connectRedis;
