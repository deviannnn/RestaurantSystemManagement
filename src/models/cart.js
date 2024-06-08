'use strict';

const ALLOWED_STATUSES = ['waiting', 'in_progress', 'finished', 'cancelled'];

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
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

            this.belongsTo(models.Item, {
                foreignKey: 'itemId',
                as: 'item'
            });
        }
    }
    Cart.init({
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        note: { type: DataTypes.STRING, allowNull: false },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            allowNull: false,
            defaultValue: 'waiting',
            validate: {
                isIn: {
                    args: [ALLOWED_STATUSES],
                    msg: "Status must be one of the allowed values"
                }
            }
        },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        sequelize,
        modelName: 'Cart',
    });
    return Cart;
};