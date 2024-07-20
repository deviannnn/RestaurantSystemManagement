const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/category-controller');
const ItemController = require('../controllers/item-controller');

// Categories CRUD
router.post('/categories', CategoryController.createCategory);
router.get('/categories/:id?', CategoryController.getCategories);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);


// Items CRUD
router.post('/items', ItemController.createItem);
router.get('/items/:id?', ItemController.getItems);
router.put('/items/:id', ItemController.updateItem);
router.delete('/items/:id', ItemController.deleteItem);

// Items Business Logic
router.post('/items/:id/toggle-available', ItemController.toggleAvailable);
router.post('/items/batch', ItemController.batchValidator);
router.get('/items-cache', ItemController.getItemsForClient);


module.exports = router;