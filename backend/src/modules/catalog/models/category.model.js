import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
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
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
});

Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });

export default Category;
