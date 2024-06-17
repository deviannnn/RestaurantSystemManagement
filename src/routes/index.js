const express = require('express');
const router = express.Router();

const v1CartRouter = require('./v1/cart');
const v1CategoryRouter = require('./v1/category');
const v1ExpenseRouter = require('./v1/expense');
const v1IncExpenseRouter = require('./v1/incidental-expense');
const v1ItemRouter = require('./v1/item');
const v1OrderRouter = require('./v1/order');
const v1PaymentRouter = require('./v1/payment');
const v1RoleRouter = require('./v1/role');
const v1TableRouter = require('./v1/table');
const v1UserRouter = require('./v1/user');
// Các router khác...

router.use('/v1/carts', require('./v1/cart'));
router.use('/v1/categories', require('./v1/category'));
router.use('/v1/expenses', require('./v1/expense'));
router.use('/v1/incidental-expenses', require('./v1/incidental-expense'));
router.use('/v1/items', require('./v1/item'));
router.use('/v1/orders', require('./v1/order'));
router.use('/v1/payments', require('./v1/payment'));
router.use('/v1/roles', require('./v1/role'));
router.use('/v1/tables', require('./v1/table'));
router.use('/v1/users', require('./v1/user'));
// Sử dụng các router khác...

module.exports = router;