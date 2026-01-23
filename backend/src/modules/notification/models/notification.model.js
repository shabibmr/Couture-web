import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from '../../identity/models/customer.model.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('payment_success', 'payment_failed', 'refund_processed', 'order_shipped', 'order_delivered'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: 'notifications',
    timestamps: true,
});

Notification.belongsTo(Customer, { foreignKey: 'user_id' });
Customer.hasMany(Notification, { foreignKey: 'user_id' });

export default Notification;
