
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const createTables = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected!');

        const tables = [
            {
                name: 'password_reset_tokens',
                query: `
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id CHAR(36) PRIMARY KEY,
                        customer_id CHAR(36) NOT NULL,
                        token VARCHAR(255) NOT NULL,
                        expires_at DATETIME NOT NULL,
                        used TINYINT(1) DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_customer (customer_id),
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
                    );
                `
            },
            {
                name: 'notifications',
                query: `
                    CREATE TABLE IF NOT EXISTS notifications (
                        id CHAR(36) PRIMARY KEY,
                        user_id CHAR(36) NOT NULL,
                        type ENUM('payment_success', 'payment_failed', 'refund_processed', 'order_shipped', 'order_delivered') NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        \`read\` TINYINT(1) DEFAULT 0,
                        metadata JSON,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_user (user_id),
                        FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE
                    );
                `
            }
        ];

        for (const table of tables) {
            console.log(`Creating table: ${table.name}...`);
            await connection.execute(table.query);
            console.log(`Table ${table.name} created or already exists.`);
        }

        console.log('All migrations completed successfully.');

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
};

createTables();
