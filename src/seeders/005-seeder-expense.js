'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    const expensesData = [
      { name: 'VAT', key: 'V', value: 0.1, isPercent: true, description: 'Value Added Tax', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Service', key: 'S', value: 0.05, isPercent: true, description: 'Service charge for restaurant services', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Holiday', key: 'H', value: 0.08, isPercent: true, description: 'Service charge for restaurant holiday', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'VIP Room 1', key: 'VIP1', value: 200, isPercent: false, description: 'VIP room service fee for under 10 people', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'VIP Room 2', key: 'VIP2', value: 300, isPercent: false, description: 'VIP room service fee for over 10 people', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Packaging Fee', key: 'P', value: -30, isPercent: false, description: 'Free for packaging materials', active: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Expenses', expensesData, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Expenses', null, {});

  }
};