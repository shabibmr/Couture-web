import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Wishlist from './wishlist.model.js';
import Product from '../../catalog/models/product.model.js';

const WishlistItem = sequelize.define('WishlistItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    wishlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Wishlist,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    }
}, {
    tableName: 'wishlist_items',
    timestamps: true,
    updatedAt: false,
    createdAt: 'added_at'
});

WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlist_id' });
WishlistItem.belongsTo(Product, { foreignKey: 'product_id' });

Wishlist.hasMany(WishlistItem, { as: 'items', foreignKey: 'wishlist_id' });

export default WishlistItem;
