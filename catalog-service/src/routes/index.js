const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/category.controller');
const ItemController = require('../controllers/item.controller');

// Categories CRUD
router.post('/v1/categories', CategoryController.createCategory);
router.get('/v1/categories/:id?', CategoryController.getCategories);
router.put('/v1/categories/:id', CategoryController.updateCategory);
router.delete('/v1/categories/:id', CategoryController.deleteCategory);


// Items CRUD
router.post('/v1/items', ItemController.createItem);
router.get('/v1/items/:id?', ItemController.getItems);
router.put('/v1/items/:id', ItemController.updateItem);
router.delete('/v1/items/:id', ItemController.deleteItem);

// Items Business Logic
router.post('/v1/items/:id/toggle-available', ItemController.toggleAvailable);
router.post('/v1/items/batch', ItemController.batchValidator);
router.get('/v2/items/', ItemController.getItemsForClient);


module.exports = router;