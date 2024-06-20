const express = require('express');
const router = express.Router();

const v1TableRouter = require('./v1/table');
// Các router khác...

router.use('/v1/tables', require('./v1/table'));
// Sử dụng các router khác...

module.exports = router;