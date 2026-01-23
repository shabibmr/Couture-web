import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Order from '../../order/models/order.model.js';
import PaymentGateway from './payment_gateway.model.js';

const PaymentTransaction = sequelize.define('PaymentTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    },
    transaction_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    payment_gateway_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: PaymentGateway,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
    gateway_response: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'payment_transactions',
    timestamps: true,
});

PaymentTransaction.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(PaymentTransaction, { foreignKey: 'order_id' });

PaymentTransaction.belongsTo(PaymentGateway, { foreignKey: 'payment_gateway_id' });

export default PaymentTransaction;
