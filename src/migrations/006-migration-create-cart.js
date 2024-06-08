'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Carts', {
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
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            itemId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Items',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            quantity: {
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            amount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            note: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: ['waiting', 'in_progress', 'finished', 'cancelled'],
                defaultValue: 'waiting'
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
        await queryInterface.dropTable('Carts');
    }
};