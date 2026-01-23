import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Order from './order.model.js';
import ProductVariant from '../../catalog/models/product_variant.model.js';

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    },
    variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ProductVariant,
            key: 'id'
        }
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    variant_sku: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'order_items',
    timestamps: true,
    updatedAt: false,
});

OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

export default OrderItem;
