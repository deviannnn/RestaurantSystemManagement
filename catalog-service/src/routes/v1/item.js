const express = require('express');
const router = express.Router();
const ItemController = require('../../controllers/item.controller');

router.post('/', ItemController.createItem);
router.get('/:id?', ItemController.getItems);
router.put('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);

module.exports = router;