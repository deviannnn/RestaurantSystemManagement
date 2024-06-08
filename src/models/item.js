'use strict';

const ALLOWED_STATUSES = ['available', 'sold_out'];

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Item extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Category, {
                foreignKey: 'categoryId',
                as: 'category'
            });
        }
    }
    Item.init({
        name: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.FLOAT, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            allowNull: false,
            defaultValue: 'available',
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
        modelName: 'Item',
    });
    return Item;
};