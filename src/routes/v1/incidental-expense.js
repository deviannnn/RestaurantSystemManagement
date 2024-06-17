const express = require('express');
const router = express.Router();
const IncExpenseController = require('../../controllers/incidental-expense.controller');

router.post('/', IncExpenseController.createIncExpense);
router.get('/:id?', IncExpenseController.getIncExpenses);
router.put('/:id', IncExpenseController.updateIncExpense);
router.delete('/:id', IncExpenseController.deleteIncExpense);

module.exports = router;