const express = require('express');
const router = express.Router();
const TableController = require('../../controllers/table.controller');

router.post('/', TableController.createTable);
router.get('/:id?', TableController.getTables);
router.put('/:id', TableController.updateTable);
router.delete('/:id', TableController.deleteTable);

module.exports = router;