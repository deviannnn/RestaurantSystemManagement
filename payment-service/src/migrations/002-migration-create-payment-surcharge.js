'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PaymentSurcharges', {
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
            surchargeId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Surcharges',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            surchargeValue: {
                allowNull: false,
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('PaymentSurcharges');
    }
};