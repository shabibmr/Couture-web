import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import ProductVariant from '../../catalog/models/product_variant.model.js';

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: ProductVariant,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    reserved_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'inventory',
    timestamps: false,
    indexes: [
        {
            fields: ['variant_id']
        }
    ]
});

Inventory.belongsTo(ProductVariant, { foreignKey: 'variant_id' });
ProductVariant.hasOne(Inventory, { foreignKey: 'variant_id' });

export default Inventory;
