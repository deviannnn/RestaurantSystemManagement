const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = async () => {
    try {
        await sequelize.authenticate();
        console.log(`MySQL connection established on port ${config.port}`);
    } catch (error) {
        console.error('Failed to connect to MySQL', error);
    }
}