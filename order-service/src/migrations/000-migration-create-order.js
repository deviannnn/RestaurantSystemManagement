'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            tableId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            totalQuantity: {
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            subAmount: {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: ['in_progress', 'finished', 'cancelled'],
                defaultValue: 'in_progress'
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
        await queryInterface.dropTable('Orders');
    }
};