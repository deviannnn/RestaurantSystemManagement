'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Categories', [
      { name: 'Appetizers', description: 'Starters or appetizers to enjoy before the main course.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Main Courses', description: 'Delicious main courses for a hearty meal.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Desserts', description: 'Sweet treats to end your meal on a delightful note.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Beverages', description: 'Refreshing drinks to complement your dining experience.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Salads', description: 'Healthy and fresh salads made with the finest ingredients.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Soups', description: 'Comforting soups perfect for any time of the day.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pasta', description: 'Delicious pasta dishes cooked to perfection.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pizza', description: 'Tasty pizzas with a variety of toppings to choose from.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sandwiches', description: 'Satisfying sandwiches filled with flavorful ingredients.', active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Side Dishes', description: 'Tasty side dishes to complement your main course.', active: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Categories', null, {});

  }
};
