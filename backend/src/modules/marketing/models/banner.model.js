import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link_url: {
        type: DataTypes.STRING,
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
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Banner;
