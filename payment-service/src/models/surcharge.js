'use strict';

const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Surcharge extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) { }
    }

    Surcharge.init({
        name: { type: DataTypes.STRING, allowNull: false },
        isPercent: { type: DataTypes.BOOLEAN, allowNull: false },
        value: { type: DataTypes.FLOAT, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    }, {
        sequelize,
        modelName: 'Surcharge',
    });

    return Surcharge;
};