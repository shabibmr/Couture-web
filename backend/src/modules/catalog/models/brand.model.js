import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    logo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'brands',
    timestamps: true,
    underscored: true,
});

export default Brand;
