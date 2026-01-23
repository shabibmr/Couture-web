import sequelize from '../config/database.js';
import Admin from '../modules/identity/models/admin.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models if needed
        await Admin.sync({ alter: true });

        const email = 'admin@example.com';
        const password = 'admin';
        // const hashedPassword = await bcrypt.hash(password, 10); // Let model hook handle hashing

        const [admin, created] = await Admin.findOrCreate({
            where: { email },
            defaults: {
                name: 'Super Admin',
                email,
                password_hash: password, // Pass plain text, hook will hash
                role: 'super_admin',
                is_active: true
            }
        });

        if (created) {
            console.log('Admin user created:', email);
        } else {
            console.log('Admin user already exists.');
            // Update password just in case
            admin.password_hash = password; // Pass plain text
            await admin.save();
            console.log('Admin password updated to default.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
