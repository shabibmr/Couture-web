import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Product from './product.model.js';

const ProductImage = sequelize.define('ProductImage', {
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
    image_url: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'product_images',
    timestamps: true,
    updatedAt: false,
    underscored: true,
});

ProductImage.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });

export default ProductImage;
