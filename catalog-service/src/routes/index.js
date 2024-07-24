const express = require('express');
const router = express.Router();

const { CategoryController, ItemController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');


router.use(authenticate);

// Categories CRUD
router.post('/categories', CategoryController.createCategory);
router.get('/categories/:categoryId?', CategoryController.getCategories);
router.put('/categories/:categoryId', CategoryController.updateCategory);
router.delete('/categories/:categoryId', CategoryController.deleteCategory);


// Items Business Logic
router.put('/items/:itemId/toggle-available', ItemController.toggleAvailable);
router.get('/items/search', ItemController.getItemsSearch);
router.post('/items/batch', ItemController.batchValidator);

// Items CRUD
router.post('/items', ItemController.createItem);
router.get('/items/:itemId?', ItemController.getItems);
router.put('/items/:itemId', ItemController.updateItem);
router.delete('/items/:itemId', ItemController.deleteItem);


// Catalog Business Logic
router.get('/catalogs', CategoryController.getFullCatalog);
router.get('/catalogs/categories/:categoryId', CategoryController.getFullCatalogByCategory);
router.get('/catalogs/items', ItemController.getFullCatalogWithItems);
router.get('/catalogs/items/search', ItemController.getCatalogItemsSearch);
router.get('/catalogs/items/:itemId', ItemController.getCatalogByItem);


module.exports = router;