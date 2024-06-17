const IncExpenseService = require('../services/incidental-expense.service');

class IncExpenseController {
    // Create a new incidental expense
    static async createIncExpense(req, res) {
        try {
            const { paymentId, expenseId, paymentValue, expenseValue, amount } = req.body;
            const newIncidentalExpense = await IncExpenseService.createIncExpense(paymentId, expenseId, paymentValue, expenseValue, amount);
            res.status(201).json(newIncidentalExpense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all incidental expenses or get incidental expense by ID
    static async getIncExpenses(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const incidentalExpense = await IncExpenseService.getIncExpenseById(id);
                if (incidentalExpense) {
                    res.status(200).json(incidentalExpense);
                } else {
                    res.status(404).json({ error: 'Incidental expense not found' });
                }
            } else {
                const incidentalExpenses = await IncExpenseService.getAllIncExpenses();
                res.status(200).json(incidentalExpenses);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update incidental expense by ID
    static async updateIncExpense(req, res) {
        try {
            const { id } = req.params;
            const { paymentId, expenseId, paymentValue, expenseValue, amount } = req.body;
            const updatedIncidentalExpense = await IncExpenseService.updateIncExpense(id, paymentId, expenseId, paymentValue, expenseValue, amount);
            if (updatedIncidentalExpense) {
                res.status(200).json(updatedIncidentalExpense);
            } else {
                res.status(404).json({ error: 'Incidental expense not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete incidental expense by ID
    static async deleteIncExpense(req, res) {
        try {
            const { id } = req.params;
            const deletedIncidentalExpense = await IncExpenseService.deleteIncExpense(id);
            if (deletedIncidentalExpense) {
                res.status(200).json(deletedIncidentalExpense);
            } else {
                res.status(404).json({ error: 'Incidental expense not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = IncExpenseController;