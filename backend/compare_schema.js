
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'couture_db',
};

const SCHEMA_FILE = './schema/ACTUAL_DB_SCHEMA.md';

async function getActualSchema() {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const [tables] = await connection.query(`SHOW TABLES`);
        const tableList = tables.map(t => Object.values(t)[0]);
        
        const schema = {};
        
        for (const tableName of tableList) {
            const [columns] = await connection.query(`
                SELECT 
                    COLUMN_NAME as name, 
                    COLUMN_TYPE as type, 
                    IS_NULLABLE as nullable, 
                    COLUMN_KEY as 'key', 
                    COLUMN_DEFAULT as 'default', 
                    EXTRA as extra
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            `, [DB_CONFIG.database, tableName]);
            
            schema[tableName] = columns.map(col => {
                const attributes = [];
                if (col.key === 'PRI') attributes.push('PK');
                if (col.key === 'UNI') attributes.push('Unique');
                if (col.nullable === 'NO') attributes.push('Not Null');
                if (col.default !== null) attributes.push(`Default: ${col.default}`);
                if (col.extra.includes('on update')) attributes.push(col.extra);
                
                return {
                    name: col.name,
                    type: col.type.toLowerCase(),
                    attributes
                };
            });
        }
        
        return schema;
    } finally {
        await connection.end();
    }
}

function parseReferenceSchema(content) {
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

        const colMatch = line.match(/^- `(.+?)`: (.+?) \((.+?)\)/);
        if (colMatch && currentTable) {
            const name = colMatch[1];
            const type = colMatch[2].toLowerCase();
            const attrStr = colMatch[3];
            const attributes = attrStr.split(', ').map(a => a.trim());
            
            tables[currentTable].push({
                name,
                type,
                attributes
            });
        } else if (line.match(/^- `(.+?)`: (.+)/) && currentTable) {
             // Case without parentheses or simple types
             const simpleMatch = line.match(/^- `(.+?)`: ([^(]+)/);
             if (simpleMatch) {
                const name = simpleMatch[1];
                const type = simpleMatch[2].trim().toLowerCase();
                tables[currentTable].push({
                    name,
                    type,
                    attributes: []
                });
             }
        }
    }
    return tables;
}

function compareSchemas(actual, reference) {
    const changes = {
        missingTables: [],
        extraTables: [],
        tableChanges: {}
    };

    const refTableNames = Object.keys(reference);
    const actTableNames = Object.keys(actual);

    // Check for missing/extra tables
    refTableNames.forEach(t => {
        if (!actual[t]) changes.missingTables.push(t);
    });
    actTableNames.forEach(t => {
        if (!reference[t]) changes.extraTables.push(t);
    });

    // Check existing tables
    refTableNames.forEach(t => {
        if (actual[t]) {
            const tableDiffs = [];
            const refCols = reference[t];
            const actCols = actual[t];

            const refColNames = refCols.map(c => c.name);
            const actColNames = actCols.map(c => c.name);

            refCols.forEach(rc => {
                const ac = actCols.find(a => a.name === rc.name);
                if (!ac) {
                    tableDiffs.push(`Missing column: ${rc.name}`);
                } else {
                    // Compare type
                    // Normalize types (int(11) vs int)
                    const normRefType = rc.type.replace(/\(.*\)/, '');
                    const normActType = ac.type.replace(/\(.*\)/, '');
                    
                    if (normRefType !== normActType && !rc.type.includes(ac.type) && !ac.type.includes(rc.type)) {
                        tableDiffs.push(`Column ${rc.name} type mismatch: expected ${rc.type}, found ${ac.type}`);
                    }

                    // Compare attributes (PK, Unique, Not Null)
                    const importantAttrs = ['pk', 'unique', 'not null'];
                    importantAttrs.forEach(attr => {
                        const hasRef = rc.attributes.some(a => a.toLowerCase().includes(attr));
                        const hasAct = ac.attributes.some(a => a.toLowerCase().includes(attr));
                        if (hasRef !== hasAct) {
                            tableDiffs.push(`Column ${rc.name} attribute ${attr} mismatch: expected ${hasRef ? 'yes' : 'no'}, found ${hasAct ? 'yes' : 'no'}`);
                        }
                    });
                }
            });

            actCols.forEach(ac => {
                if (!refColNames.includes(ac.name)) {
                    tableDiffs.push(`Extra column: ${ac.name}`);
                }
            });

            if (tableDiffs.length > 0) {
                changes.tableChanges[t] = tableDiffs;
            }
        }
    });

    return changes;
}

async function main() {
    try {
        console.log('--- Database Schema Comparison ---');
        
        if (!fs.existsSync(SCHEMA_FILE)) {
            console.error(`Error: Reference schema file not found at ${SCHEMA_FILE}`);
            process.exit(1);
        }
        
        const refContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
        const referenceSchema = parseReferenceSchema(refContent);
        
        console.log(`Loaded reference schema with ${Object.keys(referenceSchema).length} tables.`);
        
        const actualSchema = await getActualSchema();
        console.log(`Loaded actual schema from DB with ${Object.keys(actualSchema).length} tables.`);
        
        const changes = compareSchemas(actualSchema, referenceSchema);
        
        if (changes.missingTables.length === 0 && changes.extraTables.length === 0 && Object.keys(changes.tableChanges).length === 0) {
            console.log('\n✅ Schema is in sync with reference.');
        } else {
            console.log('\n❌ Differences found:');
            
            if (changes.missingTables.length > 0) {
                console.log('\nMissing Tables:');
                changes.missingTables.forEach(t => console.log(` - ${t}`));
            }
            
            if (changes.extraTables.length > 0) {
                console.log('\nExtra Tables:');
                changes.extraTables.forEach(t => console.log(` + ${t}`));
            }
            
            if (Object.keys(changes.tableChanges).length > 0) {
                console.log('\nModified Tables:');
                for (const [table, diffs] of Object.entries(changes.tableChanges)) {
                    console.log(`\n Table: ${table}`);
                    diffs.forEach(d => console.log(`   * ${d}`));
                }
            }
        }
    } catch (error) {
        console.error('Error during comparison:', error);
    }
}

main();
