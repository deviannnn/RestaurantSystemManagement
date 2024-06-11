const express = require('express');
const router = express.Router();

const v1CartRouter = require('./v1/cart');
const v1CategoryRouter = require('./v1/category');
const v1ExpenseRouter = require('./v1/expense');
const v1IncidentalExpenseRouter = require('./v1/incidental-expense');
const v1ItemRouter = require('./v1/item');
const v1OrderRouter = require('./v1/order');
const v1PaymentRouter = require('./v1/payment');
const v1RoleRouter = require('./v1/role');
const v1TableRouter = require('./v1/table');
const v1UserRouter = require('./v1/user');
// Các router khác...

router.use('/v1/carts', v1CartRouter);
router.use('/v1/categories', v1CategoryRouter);
router.use('/v1/expenses', v1ExpenseRouter);
router.use('/v1/incidental-expenses', v1IncidentalExpenseRouter);
router.use('/v1/items', v1ItemRouter);
router.use('/v1/orders', v1OrderRouter);
router.use('/v1/payments', v1PaymentRouter);
router.use('/v1/roles', v1RoleRouter);
router.use('/v1/tables', v1TableRouter);
router.use('/v1/users', v1UserRouter);
// Sử dụng các router khác...

module.exports = router;