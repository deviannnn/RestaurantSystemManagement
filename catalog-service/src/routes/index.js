const express = require('express');
const router = express.Router();

const { CategoryController, ItemController } = require('../controllers');

// Categories CRUD
router.post('/categories', CategoryController.createCategory);
router.get('/categories/:categoryId?', CategoryController.getCategories);
router.put('/categories/:categoryId', CategoryController.updateCategory);
router.delete('/categories/:categoryId', CategoryController.deleteCategory);


// Items CRUD
router.post('/items', ItemController.createItem);
router.get('/items/:itemId?', ItemController.getItems);
router.put('/items/:itemId', ItemController.updateItem);
router.delete('/items/:itemId', ItemController.deleteItem);
router.get('/items/search', ItemController.getItemsSearch);

// Items Business Logic
router.put('/items/:itemId/toggle-available', ItemController.toggleAvailable);
router.post('/items/batch', ItemController.batchValidator);


// Catalog Business Logic
router.get('/catalogs', CategoryController.getFullCatalog);
router.get('/catalogs/categories/:categoryId', CategoryController.getFullCatalogByCategory);
router.get('/catalogs/items', ItemController.getFullCatalogWithItems);
router.get('/catalogs/items/:itemId', ItemController.getCatalogByItem);
router.get('/catalogs/items/search', ItemController.getCatalogItemsSearch);


module.exports = router;