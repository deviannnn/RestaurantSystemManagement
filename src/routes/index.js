var express = require('express');
var router = express.Router();

const v1UserRouter = require('./v1/user');
// Các router khác...

router.use('/v1/users', v1UserRouter);
// Sử dụng các router khác...

module.exports = router;