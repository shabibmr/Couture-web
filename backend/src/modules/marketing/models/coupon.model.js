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
        type: DataTypes.ENUM('percentage', 'fixed', 'bogo', 'free_shipping'),
        allowNull: false,
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    min_order_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Minimum total order amount',
    },
    min_product_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Minimum price of a single product to qualify for discount',
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
    // Usage Control
    is_single_use: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'One-time use per customer',
    },
    per_customer_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Max uses per customer (null = unlimited)',
    },
    is_first_order_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Only valid for first-time customers',
    },
    // Value Limits
    max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Cap for percentage discounts',
    },
    min_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Minimum cart items required',
    },
    // Targeting
    applies_to: {
        type: DataTypes.ENUM('all', 'products', 'categories'),
        defaultValue: 'all',
    },
    applicable_product_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of targeted product IDs',
    },
    applicable_category_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of targeted category IDs',
    },
    // User Targeting
    is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Private code for specific users only',
    },
    allowed_customer_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of allowed customer IDs',
    },
    // Stacking
    is_stackable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Can be combined with other coupons',
    },
}, {
    tableName: 'coupons',
    timestamps: true,
});

export default Coupon;
