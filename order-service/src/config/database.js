require('dotenv').config();
const fs = require('fs');

module.exports = {
    development: {
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        host: process.env.DEV_DB_HOSTNAME,
        port: process.env.DEV_DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
            decimalNumbers: true
        },
        logging: false,
        timezone: process.env.TIMEZONE || '+07:00',
    },
    test: {
        username: process.env.CI_DB_USERNAME,
        password: process.env.CI_DB_PASSWORD,
        database: process.env.CI_DB_NAME,
        host: '127.0.0.1',
        port: 3306,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
        },
        timezone: process.env.TIMEZONE || '+07:00'
    },
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOSTNAME,
        port: process.env.PROD_DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
            decimalNumbers: true
            // ssl: {
            //     ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt'),
            // },
        },
        timezone: process.env.TIMEZONE || '+07:00'
    },
};