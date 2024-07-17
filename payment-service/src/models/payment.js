'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Payment.hasMany(models.PaymentSurcharge, {
                foreignKey: 'paymentId',
                as: 'surcharge'
            });
        }
    }

    Payment.init({
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        subAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        totalSurcharge: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        totalDiscount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        note: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Payment',
    });

    return Payment;
};