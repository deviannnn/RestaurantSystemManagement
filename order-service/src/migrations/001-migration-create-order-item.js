'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('OrderItems', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            orderId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE'
            },
            itemId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            quantity: {
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            price: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            amount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: ['pending', 'in_progress', 'finished', 'cancelled'],
                defaultValue: 'pending'
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
        await queryInterface.dropTable('OrderItems');
    }
};