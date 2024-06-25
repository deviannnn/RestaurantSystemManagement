'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('OrderItems', [
      {
        orderId: 1,
        itemId: 1,
        quantity: 1,
        price: 15.00,
        amount: 15.00,
        status: 'in_progress',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 1,
        itemId: 2,
        quantity: 2,
        price: 15.00,
        amount: 30.00,
        status: 'in_progress',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 2,
        itemId: 3,
        quantity: 3,
        price: 15.00,
        amount: 45.00,
        status: 'finished',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 2,
        itemId: 4,
        quantity: 2,
        price: 15.00,
        amount: 30.00,
        status: 'finished',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 3,
        itemId: 5,
        quantity: 1,
        price: 15.00,
        amount: 15.00,
        status: 'pending',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 3,
        itemId: 6,
        quantity: 1,
        price: 15.00,
        amount: 15.00,
        status: 'pending',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('OrderItems', null, {});
  }
};