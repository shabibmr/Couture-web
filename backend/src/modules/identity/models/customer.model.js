import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import bcrypt from 'bcrypt';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    oauth_provider: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    oauth_provider_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (customer) => {
            if (customer.password_hash) {
                customer.password_hash = await bcrypt.hash(customer.password_hash, 10);
            }
        },
        beforeUpdate: async (customer) => {
            if (customer.changed('password_hash')) {
                customer.password_hash = await bcrypt.hash(customer.password_hash, 10);
            }
        },
    },
});

Customer.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

export default Customer;
