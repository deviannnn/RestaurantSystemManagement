'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Expenses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            key: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            isPercent: {
                allowNull: false,
                type: Sequelize.BOOLEAN
            },
            value: {
                allowNull: false,
                type: Sequelize.FLOAT,
            },
            description: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            active: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Expenses');
    }
};