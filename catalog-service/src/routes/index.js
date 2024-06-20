const express = require('express');
const router = express.Router();

const v1CategoryRouter = require('./v1/category');
const v1ItemRouter = require('./v1/item');

// Các router khác...

router.use('/v1/categories', require('./v1/category'));
router.use('/v1/items', require('./v1/item'));
// Sử dụng các router khác...

module.exports = router;