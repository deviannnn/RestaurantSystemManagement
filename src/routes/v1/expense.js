const express = require('express');
const router = express.Router();
const ExpenseController = require('../../controllers/expense.controller');

router.post('/', ExpenseController.createExpense);
router.get('/:id?', ExpenseController.getExpenses);
router.put('/:id', ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;