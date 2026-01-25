import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'backend/.env' });

async function seedSizes() {
    try {
        console.log('Connecting to DB...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Seeding sizes...');
        const sizes = [
            { name: 'S', code: 'S', group: 'clothing', order: 1 },
            { name: 'M', code: 'M', group: 'clothing', order: 2 },
            { name: 'L', code: 'L', group: 'clothing', order: 3 },
            { name: 'XL', code: 'XL', group: 'clothing', order: 4 },
            { name: 'XXL', code: 'XXL', group: 'clothing', order: 5 }
        ];

        for (const s of sizes) {
            // Check if exists first to avoid duplicates (though UUID logic in SQL was manual)
            // Here we use auto-generated UUID via SQL UUID() or existing one? 
            // The SQL file used UUID(). We can just let Database handle it if configured, or use sql UUID().

            // Simple check by name
            const [rows] = await connection.execute('SELECT id FROM sizes WHERE name = ?', [s.name]);
            if (rows.length === 0) {
                await connection.execute(
                    'INSERT INTO sizes (id, name, code, size_group, sort_order) VALUES (UUID(), ?, ?, ?, ?)',
                    [s.name, s.code, s.group, s.order]
                );
                console.log(`Inserted ${s.name}`);
            } else {
                console.log(`Size ${s.name} already exists`);
            }
        }

        console.log('Seed sizes completed.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding sizes:', error);
        process.exit(1);
    }
}

seedSizes();
