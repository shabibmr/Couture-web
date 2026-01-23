import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Category from './category.model.js';
import Brand from './brand.model.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Category,
            key: 'id'
        }
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Brand,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sale_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    featured_image: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_new_arrival: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
});

Product.belongsTo(Category, { foreignKey: 'category_id' });
Product.belongsTo(Brand, { foreignKey: 'brand_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Brand.hasMany(Product, { foreignKey: 'brand_id' });

export default Product;
