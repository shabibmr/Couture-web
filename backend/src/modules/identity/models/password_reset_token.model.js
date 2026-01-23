import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from './customer.model.js';

const PasswordResetToken = sequelize.define('PasswordResetToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id',
        },
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'password_reset_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

PasswordResetToken.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(PasswordResetToken, { foreignKey: 'customer_id' });

export default PasswordResetToken;
