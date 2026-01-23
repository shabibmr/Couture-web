import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const ShippingMethod = sequelize.define('ShippingMethod', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    base_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    rate_type: {
        type: DataTypes.ENUM('flat', 'weight_based', 'price_based'),
        defaultValue: 'flat',
    },
    min_delivery_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    max_delivery_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'shipping_methods',
    timestamps: true,
});

export default ShippingMethod;
