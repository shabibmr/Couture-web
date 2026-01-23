import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from '../../identity/models/customer.model.js';

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'carts',
    timestamps: true,
});

Cart.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasOne(Cart, { foreignKey: 'customer_id' });

export default Cart;
