'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PaymentSurcharges', [
      {
        paymentId: 1,
        surchargeId: 1, // Service Charge
        surchargeValue: '5%',
        amount: 2.25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 1,
        surchargeId: 4, // VAT
        surchargeValue: '8%',
        amount: 3.6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 1,
        surchargeId: 7, // Packaging Support - Motorcycle
        surchargeValue: '-5',
        amount: -5.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 2,
        surchargeId: 2, // Holiday Surcharge
        surchargeValue: '15%',
        amount: 11.25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 2,
        surchargeId: 8, // Parking Support - Car
        surchargeValue: '-20',
        amount: -20.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 2,
        surchargeId: 5, // VIP Room 1
        surchargeValue: '+150',
        amount: 150.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 3,
        surchargeId: 3, // Weekend Surcharge
        surchargeValue: '3%',
        amount: 0.9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        paymentId: 3,
        surchargeId: 6, // VIP Room 2
        surchargeValue: '+280',
        amount: 280.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PaymentSurcharges', null, {});
  }
};