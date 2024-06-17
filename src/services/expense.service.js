const { Expense } = require('../models');

class ExpenseService {
    static async createExpense(name, key, isPercent, value, description, active) {
        return Expense.create({ name, key, isPercent, value, description, active })
            .then(newExpense => newExpense.get({ plain: true }));
    }

    static async getExpenseById(id) {
        return Expense.findByPk(id);
    }

    static async getAllExpenses() {
        return Expense.findAll();
    }

    static async updateExpense(id, name, key, isPercent, value, description, active) {
        const [updated] = await Expense.update({ name, key, isPercent, value, description, active }, { where: { id } });
        if (updated) {
            return Expense.findByPk(id);
        }
        return null;
    }

    static async deleteExpense(id) {
        const expense = await Expense.findByPk(id);
        if (expense) {
            await Expense.destroy({ where: { id } });
            return expense;
        }
        return null;
    }
}

module.exports = ExpenseService;