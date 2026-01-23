import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import bcrypt from 'bcrypt';

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'staff'),
        defaultValue: 'admin',
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'admins',
    timestamps: true,
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password_hash) {
                admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password_hash')) {
                admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
            }
        },
    },
});

Admin.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

export default Admin;
