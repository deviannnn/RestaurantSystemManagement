const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development2';
const config = require(__dirname + '/../config/database.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}