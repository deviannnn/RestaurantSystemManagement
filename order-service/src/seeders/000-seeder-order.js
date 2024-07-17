'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Orders', [
      {
        tableId: 1,
        userId: 1,
        active: false,
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tableId: 2,
        userId: 2,
        active: true,
        status: 'finished',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tableId: 3,
        userId: 3,
        active: false,
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