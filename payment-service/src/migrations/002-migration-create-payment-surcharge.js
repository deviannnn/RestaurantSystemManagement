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
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
            value: {
                allowNull: false,
                type: Sequelize.FLOAT
            },
            amount: {
                allowNull: false,
                type: Sequelize.FLOAT
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