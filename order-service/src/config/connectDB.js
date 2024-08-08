const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = async () => {
    try {
        await sequelize.authenticate();
        console.log(`MySQL connection established on [${config.host}:${config.port}]`);
    } catch (error) {
        console.error('[ERROR] Config -', config);
        console.error('[ERROR] Failed to connect to MySQL -', error);
        throw new Error('MySQL connection is not ready');
    }
}