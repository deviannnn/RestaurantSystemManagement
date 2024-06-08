'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('IncidentalExpenses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            paymentId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Payments',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            expenseId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Expenses',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            paymentValue: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            expenseValue: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            amount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
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
        await queryInterface.dropTable('IncidentalExpenses');
    }
};