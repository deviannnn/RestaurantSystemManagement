'use strict';

const ALLOWED_STATUSES = ['pending', 'in_progress', 'finished', 'cancelled'];

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Order, {
                foreignKey: 'orderId',
                as: 'order'
            });
        }
    }
    OrderItem.init({
        itemId: { type: DataTypes.INTEGER, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: {
                    args: [ALLOWED_STATUSES],
                    msg: "Status must be one of the allowed values"
                }
            }
        },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, {
        sequelize,
        modelName: 'OrderItem',
    });
    return OrderItem;
};