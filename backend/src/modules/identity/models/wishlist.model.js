import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Customer from './customer.model.js';

const Wishlist = sequelize.define('Wishlist', {
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
    }
}, {
    tableName: 'wishlists',
    timestamps: true,
});

Wishlist.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasOne(Wishlist, { foreignKey: 'customer_id' });

export default Wishlist;
