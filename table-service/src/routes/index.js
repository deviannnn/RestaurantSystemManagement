const express = require('express');
const router = express.Router();

const TableController = require('../controllers/table-controller');

//Tables CRUD
router.post('/v1/tables', TableController.createTable);
router.get('/v1/tables/:id?', TableController.getTables);
router.put('/v1/tables/:id', TableController.updateTable);
router.delete('/v1/tables/:id', TableController.deleteTable);

module.exports = router;