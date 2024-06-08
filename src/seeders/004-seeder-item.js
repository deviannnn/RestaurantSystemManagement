'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {

    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM Categories;'
    );

    const itemsData = [];
    categories[0].forEach(category => {
      switch (category.name) {
        case 'Appetizers':
          itemsData.push(
            { categoryId: category.id, name: 'Mozzarella Sticks', price: 5.99, image: 'mozzarella-sticks.jpg', description: 'Crispy on the outside, gooey on the inside. Served with marinara sauce.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Chicken Wings', price: 8.99, image: 'chicken-wings.jpg', description: 'Juicy and flavorful chicken wings served with your choice of sauce.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Nachos', price: 7.99, image: 'nachos.jpg', description: 'Tortilla chips topped with melted cheese, jalapeños, sour cream, and salsa.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Main Courses':
          itemsData.push(
            { categoryId: category.id, name: 'Grilled Salmon', price: 15.99, image: 'grilled-salmon.jpg', description: 'Fresh Atlantic salmon fillet seasoned and grilled to perfection.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Ribeye Steak', price: 19.99, image: 'ribeye-steak.jpg', description: 'A juicy and tender ribeye steak cooked just the way you like it.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Chicken Alfredo', price: 13.99, image: 'chicken-alfredo.jpg', description: 'Creamy fettuccine pasta with grilled chicken in a rich Alfredo sauce.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Desserts':
          itemsData.push(
            { categoryId: category.id, name: 'Chocolate Lava Cake', price: 6.99, image: 'chocolate-lava-cake.jpg', description: 'Indulge in the rich and decadent taste of chocolate lava cake with a molten center.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'New York Cheesecake', price: 5.99, image: 'new-york-cheesecake.jpg', description: 'Creamy and smooth cheesecake with a graham cracker crust.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Tiramisu', price: 7.99, image: 'tiramisu.jpg', description: 'Classic Italian dessert made with layers of coffee-soaked ladyfingers and mascarpone cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Beverages':
          itemsData.push(
            { categoryId: category.id, name: 'Iced Coffee', price: 3.99, image: 'iced-coffee.jpg', description: 'Chilled coffee served over ice cubes with a splash of milk.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Fresh Orange Juice', price: 4.99, image: 'orange-juice.jpg', description: '100% pure orange juice squeezed fresh from ripe oranges.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Mojito', price: 6.99, image: 'mojito.jpg', description: 'Refreshing cocktail made with white rum, lime juice, mint leaves, soda water, and sugar.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Salads':
          itemsData.push(
            { categoryId: category.id, name: 'Caesar Salad', price: 8.99, image: 'caesar-salad.jpg', description: 'Fresh romaine lettuce tossed with Caesar dressing, croutons, and Parmesan cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Greek Salad', price: 7.99, image: 'greek-salad.jpg', description: 'A classic Greek salad with tomatoes, cucumbers, red onions, olives, and feta cheese, drizzled with olive oil and herbs.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Caprese Salad', price: 8.99, image: 'caprese-salad.jpg', description: 'Slices of fresh tomatoes, mozzarella cheese, and basil leaves, drizzled with balsamic glaze.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Soups':
          itemsData.push(
            { categoryId: category.id, name: 'Tomato Soup', price: 4.99, image: 'tomato-soup.jpg', description: 'Classic tomato soup made with ripe tomatoes, onions, garlic, and herbs.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Chicken Noodle Soup', price: 5.99, image: 'chicken-noodle-soup.jpg', description: 'Hearty soup with tender chicken, vegetables, and egg noodles in a savory broth.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Minestrone Soup', price: 6.99, image: 'minestrone-soup.jpg', description: 'Italian vegetable soup with beans, pasta, and hearty vegetables in a flavorful tomato broth.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Pasta':
          itemsData.push(
            { categoryId: category.id, name: 'Spaghetti Carbonara', price: 11.99, image: 'spaghetti-carbonara.jpg', description: 'Classic Italian pasta dish made with spaghetti, eggs, pancetta, and Parmesan cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Fettuccine Alfredo', price: 12.99, image: 'fettuccine-alfredo.jpg', description: 'Creamy fettuccine pasta tossed in a rich Alfredo sauce made with butter, cream, and Parmesan cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Lasagna', price: 14.99, image: 'lasagna.jpg', description: 'Layers of lasagna noodles, ground beef, marinara sauce, and ricotta cheese, baked to perfection.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Pizza':
          itemsData.push(
            { categoryId: category.id, name: 'Margherita Pizza', price: 10.99, image: 'margherita-pizza.jpg', description: 'Traditional Neapolitan pizza topped with fresh tomatoes, mozzarella cheese, basil, and olive oil.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Pepperoni Pizza', price: 12.99, image: 'pepperoni-pizza.jpg', description: 'Classic pizza topped with spicy pepperoni slices and gooey mozzarella cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Vegetarian Pizza', price: 11.99, image: 'vegetarian-pizza.jpg', description: 'Delicious pizza loaded with assorted vegetables, including bell peppers, onions, olives, and mushrooms.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Sandwiches':
          itemsData.push(
            { categoryId: category.id, name: 'Club Sandwich', price: 9.99, image: 'club-sandwich.jpg', description: 'Triple-decker sandwich with layers of turkey, bacon, lettuce, tomato, and mayonnaise.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'BLT Sandwich', price: 8.99, image: 'blt-sandwich.jpg', description: 'Classic sandwich with crispy bacon, fresh lettuce, and juicy tomatoes, served on toasted bread.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Grilled Cheese Sandwich', price: 7.99, image: 'grilled-cheese-sandwich.jpg', description: 'Golden brown and crispy grilled cheese sandwich made with melted cheddar cheese.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        case 'Side Dishes':
          itemsData.push(
            { categoryId: category.id, name: 'French Fries', price: 3.99, image: 'french-fries.jpg', description: 'Crispy and golden brown French fries served hot and salted.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Onion Rings', price: 4.99, image: 'onion-rings.jpg', description: 'Battered and deep-fried onion rings with a crunchy exterior and sweet onion flavor.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
            { categoryId: category.id, name: 'Garlic Bread', price: 2.99, image: 'garlic-bread.jpg', description: 'Toasted bread topped with garlic butter and herbs, perfect for dipping in marinara sauce.', status: 'available', active: true, createdAt: new Date(), updatedAt: new Date() },
          );
          break;
        default:
          break;
      }
    });

    await queryInterface.bulkInsert('Items', itemsData);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Items', null, {});
    
  }
};