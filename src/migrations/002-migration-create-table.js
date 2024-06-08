'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Tables', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            no: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            capacity: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            isVip: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: ['free', 'occupied', 'reserved'],
                defaultValue: 'free'
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
        await queryInterface.dropTable('Tables');
    }
};