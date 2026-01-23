import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from './customer.model.js';

const CustomerAddress = sequelize.define('CustomerAddress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    address_type: {
        type: DataTypes.STRING, // 'shipping', 'billing', 'both'
        defaultValue: 'shipping',
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address_line1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address_line2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postal_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: 'India',
        allowNull: false,
    },
    is_default_shipping: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_default_billing: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'customer_addresses',
    timestamps: true,
});

CustomerAddress.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(CustomerAddress, { foreignKey: 'customer_id', as: 'addresses' });

export default CustomerAddress;
