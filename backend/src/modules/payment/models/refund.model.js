import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Order from '../../order/models/order.model.js';
import PaymentTransaction from './payment_transaction.model.js';

const Refund = sequelize.define('Refund', {
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
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: PaymentTransaction,
            key: 'id'
        }
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('requested', 'approved', 'processing', 'completed', 'rejected'),
        defaultValue: 'requested',
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    requested_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    processed_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'refunds',
    timestamps: true,
});

Refund.belongsTo(Order, { foreignKey: 'order_id' });
Refund.belongsTo(PaymentTransaction, { foreignKey: 'transaction_id' });

export default Refund;
