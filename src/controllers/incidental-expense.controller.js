const IEService = require('../services/incidental-expense.service');

class IEController {
    // Create a new incidental expense
    static async createIE(req, res) {
        try {
            const { paymentId, expenseId, paymentValue, expenseValue, amount } = req.body;
            const newIncidentalExpense = await IEService.createIE(paymentId, expenseId, paymentValue, expenseValue, amount);
            res.status(201).json(newIncidentalExpense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all incidental expenses or get incidental expense by ID
    static async getIEs(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const incidentalExpense = await IEService.getIEById(id);
                if (incidentalExpense) {
                    res.status(200).json(incidentalExpense);
                } else {
                    res.status(404).json({ error: 'Incidental expense not found' });
                }
            } else {
                const incidentalExpenses = await IEService.getAllIEs();
                res.status(200).json(incidentalExpenses);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update incidental expense by ID
    static async updateIE(req, res) {
        try {
            const { id } = req.params;
            const { paymentId, expenseId, paymentValue, expenseValue, amount } = req.body;
            const updatedIncidentalExpense = await IEService.updateIE(id, paymentId, expenseId, paymentValue, expenseValue, amount);
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
    static async deleteIE(req, res) {
        try {
            const { id } = req.params;
            const deletedIncidentalExpense = await IEService.deleteIE(id);
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

module.exports = IEController;