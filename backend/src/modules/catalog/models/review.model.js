import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Product from './product.model.js';
import Customer from '../../identity/models/customer.model.js';

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id',
        },
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved', // Auto-approve for MVP, can be changed later
    },
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Review.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(Review, { foreignKey: 'product_id' });

Review.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Review, { foreignKey: 'customer_id' });

export default Review;
