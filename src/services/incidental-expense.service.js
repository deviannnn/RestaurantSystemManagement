const { IncidentalExpense, Payment, Expense } = require('../models');

class IEService {
    static async createIE(paymentId, expenseId, paymentValue, expenseValue, amount) {
        return IncidentalExpense.create({ paymentId, expenseId, paymentValue, expenseValue, amount })
            .then(newIncidentalExpense => newIncidentalExpense.get({ plain: true }));
    }

    static async getIEById(id) {
        return IncidentalExpense.findByPk(id, {
            include: [
                { model: Payment, as: 'payment' },
                { model: Expense, as: 'expense' }
            ]
        });
    }

    static async getAllIEs() {
        return IncidentalExpense.findAll({
            include: [
                { model: Payment, as: 'payment' },
                { model: Expense, as: 'expense' }
            ]
        });
    }

    static async updateIE(id, paymentId, expenseId, paymentValue, expenseValue, amount) {
        const [updated] = await IncidentalExpense.update({ paymentId, expenseId, paymentValue, expenseValue, amount }, { where: { id } });
        if (updated) {
            return IncidentalExpense.findByPk(id, {
                include: [
                    { model: Payment, as: 'payment' },
                    { model: Expense, as: 'expense' }
                ]
            });
        }
        return null;
    }

    static async deleteIE(id) {
        const incidentalExpense = await IncidentalExpense.findByPk(id);
        if (incidentalExpense) {
            await IncidentalExpense.destroy({ where: { id } });
            return incidentalExpense;
        }
        return null;
    }
}

module.exports = IEService;