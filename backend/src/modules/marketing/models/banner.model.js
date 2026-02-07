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
    getterMethods: {
        image() {
            return this.getDataValue('image_url');
        },
        link() {
            return this.getDataValue('link_url');
        },
        order() {
            return this.getDataValue('sort_order');
        },
        isActive() {
            return this.getDataValue('is_active');
        },
        start() {
            return this.getDataValue('start_date');
        },
        end() {
            return this.getDataValue('end_date');
        },
    },
    setterMethods: {
        image(value) {
            this.setDataValue('image_url', value);
        },
        link(value) {
            this.setDataValue('link_url', value);
        },
        order(value) {
            this.setDataValue('sort_order', value);
        },
        isActive(value) {
            this.setDataValue('is_active', value);
        },
        start(value) {
            this.setDataValue('start_date', value);
        },
        end(value) {
            this.setDataValue('end_date', value);
        },
    },
});

export default Banner;
