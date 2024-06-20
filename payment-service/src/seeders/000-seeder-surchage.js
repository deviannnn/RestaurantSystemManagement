'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Surcharges', [
      {
        name: 'Service Charge',
        isPercent: true,
        value: 5.0,
        description: 'Service charge for dining',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Holiday Surcharge',
        isPercent: false,
        value: 15.0,
        description: 'Additional charge during holidays',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Weekend Surcharge',
        isPercent: true,
        value: 3.0,
        description: 'Additional charge during weekends',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VAT',
        isPercent: true,
        value: 8.0,
        description: 'Value Added Tax',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VIP Room 1',
        isPercent: false,
        value: 150.0,
        description: 'Charge for VIP room service (less than 10 people)',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VIP Room 2',
        isPercent: false,
        value: 280.0,
        description: 'Charge for VIP room service (more than 10 people)',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Packaging Support - Motorcycle',
        isPercent: false,
        value: -5.0,
        description: 'Support for motorcycle parking costs',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Parking Support - Car',
        isPercent: false,
        value: -20.0,
        description: 'Support for car parking costs',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Surcharges', null, {});
  }
};