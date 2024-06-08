'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Tables', [
      { no: 'Table 1', capacity: 4, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 2', capacity: 6, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 3', capacity: 2, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 4', capacity: 8, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 5', capacity: 4, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 6', capacity: 6, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 7', capacity: 2, isVip: false, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 8', capacity: 6, isVip: true, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 9', capacity: 8, isVip: true, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() },
      { no: 'Table 10', capacity: 10, isVip: true, status: 'free', active: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Tables', null, {});

  }
};