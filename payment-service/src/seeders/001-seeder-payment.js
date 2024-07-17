'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Payments', [
      {
        userId: 4,
        orderId: 1,
        subAmount: 45.00,
        totalSurcharge: 5.85,
        totalDiscount: 0.00,
        totalAmount: 50.85,
        note: 'Payment for table 1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 4,
        orderId: 2,
        subAmount: 75.00,
        totalSurcharge: 161.25,
        totalDiscount: 0.00,
        totalAmount: 236.25,
        note: 'Payment for table 2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 5,
        orderId: 3,
        subAmount: 30.00,
        totalSurcharge: 280.9,
        totalDiscount: 200.00,
        totalAmount: 110.9,
        note: 'Payment for table 3',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};