const express = require('express');
const router = express.Router();
const CategoryController = require('../../controllers/category.controller');

router.post('/', CategoryController.createCategory);
router.get('/:id?', CategoryController.getCategories);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;