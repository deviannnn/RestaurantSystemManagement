const express = require('express');
const router = express.Router();
const ItemController = require('../../controllers/item.controller');

router.post('/', ItemController.createItem);
router.get('/:id?', ItemController.getItems);

router.get('/client/items', ItemController.getItemsForClient);

router.put('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);

router.post('/toggle/:id', ItemController.toggleAvailable);

router.post('/batch',ItemController.batchValidator);

module.exports = router;