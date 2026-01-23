import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Order from './order.model.js';

const Shipment = sequelize.define('Shipment', {
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
    tracking_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    carrier_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'),
        defaultValue: 'preparing',
    },
    shipped_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    estimated_delivery: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    delivered_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'shipments',
    timestamps: true,
});

Shipment.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(Shipment, { foreignKey: 'order_id' });

export default Shipment;
