import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Color = sequelize.define('Color', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hex_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rgb_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'colors',
    tableName: 'colors',
    timestamps: false,
});

export default Color;
