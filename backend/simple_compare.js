
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'couture_db',
};

const SCHEMA_FILE = './schema/ACTUAL_DB_SCHEMA.md';

async function getActualTableStructure() {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const [tables] = await connection.query(`SHOW TABLES`);
        const tableList = tables.map(t => Object.values(t)[0]);

        const structure = {};

        for (const tableName of tableList) {
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            `, [DB_CONFIG.database, tableName]);

            structure[tableName] = columns.map(c => c.COLUMN_NAME);
        }

        return structure;
    } finally {
        await connection.end();
    }
}

function parseReferenceStructure(content) {
    const tables = {};
    const lines = content.split('\n');
    let currentTable = null;

    for (const line of lines) {
        const tableMatch = line.match(/^### `(.+?)`/);
        if (tableMatch) {
            currentTable = tableMatch[1];
            tables[currentTable] = [];
            continue;
        }

        // Match column definitions, handling both detail and simple versions
        // Matches "- `col_name`:"
        const colMatch = line.match(/^- `(.+?)`:/);
        if (colMatch && currentTable) {
            tables[currentTable].push(colMatch[1]);
        }
    }
    return tables;
}

function compareStructures(actual, reference) {
    const report = [];

    const refTables = Object.keys(reference);
    const actTables = Object.keys(actual);

    // 1. Check Table Existence
    const missingTables = refTables.filter(t => !actual[t]);
    const extraTables = actTables.filter(t => !reference[t]);
    const commonTables = refTables.filter(t => actual[t]);

    if (missingTables.length > 0) {
        report.push("MISSING TABLES (Present in Schema, Access Missing in DB):");
        missingTables.forEach(t => report.push(`  - ${t}`));
        report.push("");
    }

    if (extraTables.length > 0) {
        report.push("EXTRA TABLES (Present in DB, Missing in Schema):");
        extraTables.forEach(t => report.push(`  + ${t}`));
        report.push("");
    }

    // 2. Check Columns in Common Tables
    const tableDiffs = [];
    commonTables.forEach(table => {
        const refCols = reference[table];
        const actCols = actual[table];

        const missingCols = refCols.filter(c => !actCols.includes(c));
        const extraCols = actCols.filter(c => !refCols.includes(c));

        if (missingCols.length > 0 || extraCols.length > 0) {
            tableDiffs.push(`TABLE: ${table}`);
            if (missingCols.length > 0) {
                missingCols.forEach(c => tableDiffs.push(`  - Missing Field: ${c}`));
            }
            if (extraCols.length > 0) {
                extraCols.forEach(c => tableDiffs.push(`  + Extra Field:   ${c}`));
            }
            tableDiffs.push("");
        }
    });

    if (tableDiffs.length > 0) {
        report.push("FIELD DIFFERENCES:");
        report.push(...tableDiffs);
    }

    if (missingTables.length === 0 && extraTables.length === 0 && tableDiffs.length === 0) {
        report.push("NO DIFFERENCES FOUND in Table Names or Field Names.");
    }

    return report.join('\n');
}

async function main() {
    try {
        if (!fs.existsSync(SCHEMA_FILE)) {
            console.error(`Error: Reference schema file not found at ${SCHEMA_FILE}`);
            process.exit(1);
        }

        const refContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
        const referenceStruct = parseReferenceStructure(refContent);

        const actualStruct = await getActualTableStructure();

        const report = compareStructures(actualStruct, referenceStruct);
        console.log("--- SCHEMA COMPARISON REPORT (Names Only) ---");
        console.log(report);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
