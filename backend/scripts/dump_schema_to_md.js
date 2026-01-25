
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function dumpSchema() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        const dbName = process.env.DB_NAME;
        console.log(`Analyzing database: ${dbName}`);

        // Get all tables
        const [tables] = await connection.execute(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
            [dbName]
        );

        let markdown = `# Actual Database Schema\n\nGenerated from database: ${dbName}\n\n`;

        if (tables.length === 0) {
            markdown += 'No tables found in the database.\n';
        }

        for (const table of tables) {
            const tableName = table.TABLE_NAME || table.table_name; // Mysql2 might return lowercase or uppercase depending on config
            markdown += `### \`${tableName}\`\n`;

            // Get columns
            const [columns] = await connection.execute(
                `SELECT column_name, column_type, is_nullable, column_key, column_default, extra 
                 FROM information_schema.columns 
                 WHERE table_schema = ? AND table_name = ? 
                 ORDER BY ordinal_position`,
                [dbName, tableName]
            );

            for (const col of columns) {
                const colName = col.COLUMN_NAME || col.column_name;
                const colType = col.COLUMN_TYPE || col.column_type;
                const isNullable = (col.IS_NULLABLE || col.is_nullable) === 'YES';
                const colKey = col.COLUMN_KEY || col.column_key;
                const colDefault = col.COLUMN_DEFAULT || col.column_default;
                const extra = col.EXTRA || col.extra;

                let details = [];
                if (colKey === 'PRI') details.push('PK');
                if (colKey === 'UNI') details.push('Unique');
                if (colKey === 'MUL') details.push('Index');
                if (!isNullable) details.push('Not Null');
                if (colDefault !== null) details.push(`Default: ${colDefault}`);
                if (extra) details.push(extra);

                const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
                markdown += `- \`${colName}\`: ${colType}${detailsStr}\n`;
            }
            markdown += '\n';
        }

        const outputPath = path.join(__dirname, '../schema/ACTUAL_DB_SCHEMA.md');
        await fs.writeFile(outputPath, markdown);
        console.log(`Schema dump successfully written to ${outputPath}`);

    } catch (error) {
        console.error('Error dumping schema:', error);
    } finally {
        await connection.end();
    }
}

dumpSchema();
