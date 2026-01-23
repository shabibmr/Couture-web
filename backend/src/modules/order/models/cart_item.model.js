import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Cart from './cart.model.js';
import ProductVariant from '../../catalog/models/product_variant.model.js';

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cart_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Cart,
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
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
    },
    added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'cart_items',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['cart_id', 'variant_id']
        }
    ]
});

CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });

export default CartItem;
