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
        email: 'admin@example.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.',
        active: true,
        refreshToken: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 2,
        fullName: 'Manager User',
        gender: true,
        nationalId: '5464568768',
        phone: '05464568768',
        email: 'manager@example.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.',
        active: true,
        refreshToken: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 3,
        fullName: 'Chef User',
        gender: false,
        nationalId: '543216789',
        phone: '0543216789',
        email: 'chef@example.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.',
        active: true,
        refreshToken: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 4,
        fullName: 'Staff User',
        gender: true,
        nationalId: '3453453459',
        phone: '03453453459',
        email: 'staff@example.com',
        password: '$2b$10$Y3CMsYsQxgvxStO6/vH7iOIvom6C8w40CX1nDUD81VdRvunjCdAx.',
        active: true,
        refreshToken: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Users', null, {});

  }
};