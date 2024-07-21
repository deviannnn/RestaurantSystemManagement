const express = require('express');
const router = express.Router();

const TableController = require('../controllers/table-controller');

// Tables CRUD
router.post('/tables', TableController.createTable);
router.get('/tables/:tableId?', TableController.getTables);
router.put('/tables/:tableId', TableController.updateTable);
router.delete('/tables/:tableId', TableController.deleteTable);

module.exports = router;