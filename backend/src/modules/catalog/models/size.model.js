import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Size = sequelize.define('Size', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    size_group: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'sizes',
    tableName: 'sizes',
    timestamps: false,
});

export default Size;
