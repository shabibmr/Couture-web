import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function checkProducts() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const [rows] = await connection.execute('SELECT id, name, slug, featured_image FROM products LIMIT 10');
        console.log('--- Products ---');
        console.log(JSON.stringify(rows, null, 2));

        const [variants] = await connection.execute('SELECT id, product_id, sku FROM product_variants LIMIT 10');
        console.log('--- Variants ---');
        console.log(JSON.stringify(variants, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
