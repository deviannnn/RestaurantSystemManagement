'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PaymentSurcharge extends Model {
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

            // this.belongsTo(models.Surcharge, {
            //     foreignKey: 'surchargeId',
            //     as: 'surcharge'
            // });
        }
    }

    PaymentSurcharge.init({
        surchargeValue: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
    }, {
        sequelize,
        modelName: 'PaymentSurcharge',
    });

    return PaymentSurcharge;
};
