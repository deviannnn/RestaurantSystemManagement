'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class IncidentalExpense extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Payment, {
                foreignKey: 'paymentId',
                as: 'payment'
            });

            this.belongsTo(models.Expense, {
                foreignKey: 'expenseId',
                as: 'expense'
            });
        }
    }

    IncidentalExpense.init({
        paymentValue: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        expenseValue: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
    }, {
        sequelize,
        modelName: 'IncidentalExpense',
    });

    return IncidentalExpense;
};
