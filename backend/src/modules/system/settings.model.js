import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'settings',
    timestamps: true,
});

export default Setting;
