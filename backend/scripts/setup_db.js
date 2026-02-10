
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.join(rootDir, 'backend');

// Try loading env from backend/.env first, then root .env if needed
const backendEnvPath = path.join(backendDir, '.env');
if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
} else {
    dotenv.config({ path: path.join(rootDir, '.env') });
}

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Can be empty string
    port: process.env.DB_PORT || 3306,
};
const DB_NAME = process.env.DB_NAME || 'couture_db';

async function setupDatabase() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        // Connect without database selected to create it
        connection = await mysql.createConnection({
            ...DB_CONFIG,
            multipleStatements: true
        });

        console.log(`🗑️  Dropping database '${DB_NAME}' (cleaning start)...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\`;`);

        console.log(`🔨 Creating database '${DB_NAME}'...`);
        await connection.query(`CREATE DATABASE \`${DB_NAME}\`;`);

        console.log(`🔄 Switching to database '${DB_NAME}'...`);
        await connection.changeUser({ database: DB_NAME });

        // 1. Run Main Schema
        const schemaPath = path.join(rootDir, 'setup_db_mysql.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📜 Executing main schema (setup_db_mysql.sql)...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Split statements by semicolon, filtering out empty strings/whitespace
            const statements = schemaSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    // Ignore "Duplicate key name" (1061) output "Table already exists" (1050)
                    if (err.errno === 1061 || err.errno === 1050) {
                        // console.warn(`⚠️  Skipping duplicate: ${err.sqlMessage}`);
                    } else {
                        // Throw other errors
                        console.error(`❌ Failed to execute statement: ${statement.substring(0, 50)}...`);
                        throw err;
                    }
                }
            }
            console.log('✅ Main schema applied.');
        } else {
            console.warn('⚠️ setup_db_mysql.sql not found at project root.');
        }

        // 2. Run Banner Seed (if exists)
        const bannerSeedPath = path.join(backendDir, 'seed_banner.sql');
        if (fs.existsSync(bannerSeedPath)) {
            console.log('🌱 Seeding banner data...');
            const bannerSql = fs.readFileSync(bannerSeedPath, 'utf8');
            await connection.query(bannerSql);
            console.log('✅ Banner data seeded.');
        }

        // 3. Create Additional Tables (from sync_missing_tables.js)
        console.log('🛠️  Syncing additional tables...');
        const additionalTables = [
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

        for (const table of additionalTables) {
            await connection.query(table.query);
            console.log(`   - Verified/Created table: ${table.name}`);
        }

        console.log('\n✨ Database setup completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during database setup:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
