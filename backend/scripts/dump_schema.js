import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function dumpSchema() {
    let connection;

    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database:', process.env.DB_NAME);

        // Get all tables
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
            [process.env.DB_NAME]
        );

        let schemaOutput = `# Actual Database Schema\n\nGenerated from database: ${process.env.DB_NAME}\n\n`;

        // For each table, get column information
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`Processing table: ${tableName}`);

            // Get columns with detailed information
            const [columns] = await connection.query(`
                SELECT 
                    COLUMN_NAME,
                    COLUMN_TYPE,
                    IS_NULLABLE,
                    COLUMN_KEY,
                    COLUMN_DEFAULT,
                    EXTRA
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `, [process.env.DB_NAME, tableName]);

            // Get indexes
            const [indexes] = await connection.query(`
                SHOW INDEX FROM \`${tableName}\`
            `);

            schemaOutput += `### \`${tableName}\`\n`;

            for (const col of columns) {
                const columnName = col.COLUMN_NAME;
                const columnType = col.COLUMN_TYPE;
                const isNullable = col.IS_NULLABLE === 'YES';
                const columnKey = col.COLUMN_KEY;
                const columnDefault = col.COLUMN_DEFAULT;
                const extra = col.EXTRA;

                // Build metadata
                let metadata = [];

                if (columnKey === 'PRI') {
                    metadata.push('PK');
                } else if (columnKey === 'UNI') {
                    metadata.push('Unique');
                }

                // Check if indexed (not PK or UNI)
                const isIndexed = indexes.some(idx =>
                    idx.Column_name === columnName &&
                    idx.Key_name !== 'PRIMARY' &&
                    !idx.Non_unique
                );
                const hasNonUniqueIndex = indexes.some(idx =>
                    idx.Column_name === columnName &&
                    idx.Key_name !== 'PRIMARY' &&
                    idx.Non_unique === 1
                );

                if (hasNonUniqueIndex && columnKey !== 'PRI' && columnKey !== 'UNI') {
                    metadata.push('Index');
                }

                if (!isNullable) {
                    metadata.push('Not Null');
                }

                if (columnDefault !== null) {
                    if (columnDefault === 'current_timestamp()' || extra.includes('DEFAULT_GENERATED')) {
                        metadata.push(`Default: ${columnDefault}`);
                    } else {
                        metadata.push(`Default: ${columnDefault}`);
                    }
                }

                if (extra && extra !== '' && !extra.includes('DEFAULT_GENERATED')) {
                    const extraLower = extra.toLowerCase();
                    if (extraLower.includes('on update current_timestamp')) {
                        metadata.push('on update current_timestamp()');
                    } else if (extraLower.includes('auto_increment')) {
                        metadata.push('auto_increment');
                    }
                }

                const metadataStr = metadata.length > 0 ? ` (${metadata.join(', ')})` : '';
                schemaOutput += `- \`${columnName}\`: ${columnType}${metadataStr}\n`;
            }

            schemaOutput += '\n';
        }

        // Write to file
        const outputPath = path.join(__dirname, '../schema/ACTUAL_DB_SCHEMA.md');
        await fs.writeFile(outputPath, schemaOutput);

        console.log(`\nSchema dumped successfully to: ${outputPath}`);
        console.log(`Total tables: ${tables.length}`);

    } catch (error) {
        console.error('Error dumping schema:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the dump
dumpSchema().catch(console.error);
