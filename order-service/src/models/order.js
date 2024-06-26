'use strict';

const ALLOWED_STATUSES = ['in_progress', 'finished', 'cancelled'];

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
            this.hasMany(models.OrderItem, {
                foreignKey: 'orderId',
                as: 'items'
            });
        }
    }
    Order.init({
        tableId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        totalQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        subAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            allowNull: false,
            defaultValue: 'in_progress',
            validate: {
                isIn: {
                    args: [ALLOWED_STATUSES],
                    msg: "Status must be one of the allowed values"
                }
            }
        },
    }, {
        sequelize,
        modelName: 'Order',
    });
    return Order;
};