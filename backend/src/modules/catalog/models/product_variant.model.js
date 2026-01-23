import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Product from './product.model.js';
import Size from './size.model.js';
import Color from './color.model.js';

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
    sku: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    size_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Size,
            key: 'id'
        }
    },
    color_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Color,
            key: 'id'
        }
    },
    variant_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    variant_image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'product_variants',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['product_id', 'size_id', 'color_id']
        }
    ]
});

ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });
ProductVariant.belongsTo(Size, { foreignKey: 'size_id' });
ProductVariant.belongsTo(Color, { foreignKey: 'color_id' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
Size.hasMany(ProductVariant, { foreignKey: 'size_id' });
Color.hasMany(ProductVariant, { foreignKey: 'color_id' });

export default ProductVariant;
