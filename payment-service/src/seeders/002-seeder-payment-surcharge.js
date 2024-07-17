'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PaymentSurcharges', [
      {
        paymentId: 1,
        surchargeId: 1, // Service Charge
        value: 0.05,
        amount: 2.25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 1,
        surchargeId: 4, // VAT
        value: 0.08,
        amount: 3.6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 2,
        surchargeId: 2, // Holiday Surcharge
        value: 0.15,
        amount: 11.25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 2,
        surchargeId: 5, // VIP Room 1
        value: 150.0,
        amount: 150.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 3,
        surchargeId: 3, // Weekend Surcharge
        value: 0.03,
        amount: 0.9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 3,
        surchargeId: 6, // VIP Room 2
        value: 280.0,
        amount: 280.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PaymentSurcharges', null, {});
  }
};