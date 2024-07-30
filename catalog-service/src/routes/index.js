const express = require('express');
const router = express.Router();

const { CategoryController, ItemController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');


router.use(authenticate);

// Categories CRUD
router.post('/categories', authorize(["admin"]), CategoryController.createCategory);
router.get('/categories/:categoryId?', authorize(["admin, manager, chef"]), CategoryController.getCategories); // req.query.include ?
router.put('/categories/:categoryId', authorize(["admin"]), CategoryController.updateCategory);
router.delete('/categories/:categoryId', authorize(["admin"]), CategoryController.deleteCategory);


// Items Business Logic
router.put('/items/:itemId/toggle-available', authorize(["admin", "manager", "chef"]), ItemController.toggleAvailable);
router.get('/items/search', authorize(["admin, manager, chef"]), ItemController.getItemsSearch);
router.post('/items/batch', ItemController.batchValidator);

// Items CRUD
router.post('/items', authorize(["admin"]), ItemController.createItem);
router.get('/items/:itemId?', authorize(["admin, manager, chef"]), ItemController.getItems);
router.put('/items/:itemId', authorize(["admin"]), ItemController.updateItem);
router.delete('/items/:itemId', authorize(["admin"]), ItemController.deleteItem);


// Catalog Business Logic
router.get('/catalogs', CategoryController.getFullCatalog);
router.get('/catalogs/categories/:categoryId', CategoryController.getFullCatalogByCategory);
router.get('/catalogs/items', ItemController.getFullCatalogWithItems);
router.get('/catalogs/items/search', ItemController.getCatalogItemsSearch);
router.get('/catalogs/items/:itemId', ItemController.getCatalogByItem);


module.exports = router;