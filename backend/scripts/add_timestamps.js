import sequelize from '../src/config/database.js';

const tables = ['categories', 'products', 'brands', 'product_images'];

const runMigration = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection estabilished.');

        for (const table of tables) {
            console.log(`Checking table: ${table}`);
            const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE 'created_at'`);

            if (columns.length === 0) {
                console.log(`Adding created_at to ${table}`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
            } else {
                console.log(`created_at already exists in ${table}`);
            }

            const [columnsUpdate] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE 'updated_at'`);
            if (columnsUpdate.length === 0) {
                console.log(`Adding updated_at to ${table}`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            } else {
                console.log(`updated_at already exists in ${table}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
