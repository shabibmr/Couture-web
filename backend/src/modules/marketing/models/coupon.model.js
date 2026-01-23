import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed', 'bogo'),
        allowNull: false,
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    min_order_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    valid_from: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    valid_until: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'coupons',
    timestamps: true,
});

export default Coupon;
