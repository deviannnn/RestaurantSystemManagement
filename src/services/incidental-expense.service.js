const { IncExpense, Payment, Expense } = require('../models');

class IncExpenseService {
    static async createIncExpense(paymentId, expenseId, paymentValue, expenseValue, amount) {
        return IncExpense.create({ paymentId, expenseId, paymentValue, expenseValue, amount })
            .then(newIncExpense => newIncExpense.get({ plain: true }));
    }

    static async getIncExpenseById(id) {
        return IncExpense.findByPk(id, {
            include: [
                { model: Payment, as: 'payment' },
                { model: Expense, as: 'expense' }
            ]
        });
    }

    static async getAllIncExpenses() {
        return IncExpense.findAll({
            include: [
                { model: Payment, as: 'payment' },
                { model: Expense, as: 'expense' }
            ]
        });
    }

    static async updateIncExpense(id, paymentId, expenseId, paymentValue, expenseValue, amount) {
        const [updated] = await IncExpense.update({ paymentId, expenseId, paymentValue, expenseValue, amount }, { where: { id } });
        if (updated) {
            return IncExpense.findByPk(id, {
                include: [
                    { model: Payment, as: 'payment' },
                    { model: Expense, as: 'expense' }
                ]
            });
        }
        return null;
    }

    static async deleteIncExpense(id) {
        const incidentalExpense = await IncExpense.findByPk(id);
        if (incidentalExpense) {
            await IncExpense.destroy({ where: { id } });
            return incidentalExpense;
        }
        return null;
    }
}

module.exports = IncExpenseService;