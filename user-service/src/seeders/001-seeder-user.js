'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [
      {
        roleId: 1,
        fullName: 'Admin User',
        gender: true,
        nationalId: '123456789',
        phone: '0123456789',
        gmail: 'admin@gmail.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.', // 123456
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 2,
        fullName: 'Manager User',
        gender: true,
        nationalId: '123456788',
        phone: '0123456788',
        gmail: 'manager@gmail.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.', // 123456
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 3,
        fullName: 'Chef User',
        gender: false,
        nationalId: '123456787',
        phone: '0123456787',
        gmail: 'chef@gmail.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.', // 123456
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 4,
        fullName: 'Waiter User',
        gender: true,
        nationalId: '123456786',
        phone: '0123456786',
        gmail: 'waiter@gmail.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.', // 123456
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Users', null, {});

  }
};