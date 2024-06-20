'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Orders', [
      {
        tableId: 1,
        userId: 1,
        totalQuantity: 3,
        subAmount: 45.00,
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tableId: 2,
        userId: 2,
        totalQuantity: 5,
        subAmount: 75.00,
        status: 'finished',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tableId: 3,
        userId: 3,
        totalQuantity: 2,
        subAmount: 30.00,
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Orders', null, {});
  }
};