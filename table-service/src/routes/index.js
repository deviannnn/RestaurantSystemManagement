const express = require('express');
const router = express.Router();

const TableController = require('../controllers/table-controller');

// Tables CRUD
router.post('/tables', TableController.createTable);
router.get('/tables/:id?', TableController.getTables);
router.put('/tables/:id', TableController.updateTable);
router.delete('/tables/:id', TableController.deleteTable);

module.exports = router;