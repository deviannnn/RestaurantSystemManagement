'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Table, {
                foreignKey: 'tableId',
                as: 'table'
            });

            this.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }
    Order.init({
        totalQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    }, {
        sequelize,
        modelName: 'Order',
    });
    return Order;
};