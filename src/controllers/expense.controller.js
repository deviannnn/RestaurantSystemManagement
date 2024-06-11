const ExpenseService = require('../services/expense.service');

class ExpenseController {
    // Create a new expense
    static async createExpense(req, res) {
        try {
            const { name, key, isPercent, value, description, active } = req.body;
            const newExpense = await ExpenseService.createExpense(name, key, isPercent, value, description, active);
            res.status(201).json(newExpense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all expenses or get expense by ID
    static async getExpenses(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const expense = await ExpenseService.getExpenseById(id);
                if (expense) {
                    res.status(200).json(expense);
                } else {
                    res.status(404).json({ error: 'Expense not found' });
                }
            } else {
                const expenses = await ExpenseService.getAllExpenses();
                res.status(200).json(expenses);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update expense by ID
    static async updateExpense(req, res) {
        try {
            const { id } = req.params;
            const { name, key, isPercent, value, description, active } = req.body;
            const updatedExpense = await ExpenseService.updateExpense(id, name, key, isPercent, value, description, active);
            if (updatedExpense) {
                res.status(200).json(updatedExpense);
            } else {
                res.status(404).json({ error: 'Expense not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete expense by ID
    static async deleteExpense(req, res) {
        try {
            const { id } = req.params;
            const deletedExpense = await ExpenseService.deleteExpense(id);
            if (deletedExpense) {
                res.status(200).json(deletedExpense);
            } else {
                res.status(404).json({ error: 'Expense not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ExpenseController;