import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Coupon from './coupon.model.js';
import Customer from '../../identity/models/customer.model.js';

/**
 * CouponUsage Model
 * Tracks per-customer coupon usage for single-use and per-customer-limit validation
 */
const CouponUsage = sequelize.define('CouponUsage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    coupon_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Coupon,
            key: 'id'
        }
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Reference to the order where coupon was used'
    },
    used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'coupon_usages',
    timestamps: false,
    indexes: [
        {
            unique: false,
            fields: ['coupon_id', 'customer_id'],
            name: 'idx_coupon_usage_lookup'
        }
    ]
});

// Associations
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id' });
CouponUsage.belongsTo(Customer, { foreignKey: 'customer_id' });

Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });

export default CouponUsage;
