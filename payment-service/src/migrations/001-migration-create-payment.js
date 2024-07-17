'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Payments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            orderId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            subAmount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            totalSurcharge: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            totalDiscount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            totalAmount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            note: {
                allowNull: true,
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('Payments');
    }
};