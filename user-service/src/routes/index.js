const express = require('express');
const router = express.Router();

const v1RoleRouter = require('./v1/role');
const v1UserRouter = require('./v1/user');
// Các router khác...

router.use('/v1/roles', require('./v1/role'));
router.use('/v1/users', require('./v1/user'));
// Sử dụng các router khác...

module.exports = router;