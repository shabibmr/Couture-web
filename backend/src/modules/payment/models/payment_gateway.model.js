import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const PaymentGateway = sequelize.define('PaymentGateway', {
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
        type: DataTypes.STRING, // 'razorpay', 'cod'
        unique: true,
        allowNull: false,
    },
    credentials: {
        type: DataTypes.JSON, // Store partial or encrypted creds if needed, though env is better for secrets
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'payment_gateways',
    tableName: 'payment_gateways',
    timestamps: false,
});

export default PaymentGateway;
