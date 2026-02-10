import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from '../../identity/models/customer.model.js';
import Coupon from '../../marketing/models/coupon.model.js';
import ShippingMethod from './shipping_method.model.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending',
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    shipping_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    coupon_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Coupon,
            key: 'id'
        }
    },
    coupon_code: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Stores coupon codes as JSON array for multi-coupon support'
    },
    shipping_method_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: ShippingMethod,
            key: 'id'
        }
    },
    shipping_address: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    billing_address: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    customer_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'orders',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

Order.belongsTo(Coupon, { foreignKey: 'coupon_id' });
Order.belongsTo(ShippingMethod, { foreignKey: 'shipping_method_id' });

export default Order;
