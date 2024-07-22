const express = require('express');
const router = express.Router();

const TableController = require('../controllers/table-controller');
const { extractUserFromHeaders, authorize } = require('../middlewares/auth');


router.use(extractUserFromHeaders);

// Tables CRUD
router.post('/tables', TableController.createTable);
router.get('/tables/:tableId?', TableController.getTables);
router.put('/tables/:tableId', authorize(["admin"]), TableController.updateTable);
router.delete('/tables/:tableId', authorize(["admin"]), TableController.deleteTable);

module.exports = router;