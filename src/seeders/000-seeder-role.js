'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manager',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'cashier',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'staff',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Roles', null, {});

  }
};