'use strict';

const ALLOWED_STATUSES = ['free', 'occupied', 'reserved'];

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Table extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            
        }
    }
    Table.init({
        no: { type: DataTypes.STRING, allowNull: false },
        capacity: { type: DataTypes.INTEGER, allowNull: false },
        isVip: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        status: {
            type: DataTypes.ENUM(...ALLOWED_STATUSES),
            allowNull: false,
            defaultValue: 'free',
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
        modelName: 'Table',
    });
    return Table;
};