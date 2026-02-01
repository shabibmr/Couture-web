import sequelize from '../src/config/database.js';

const runMigration = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection estabilished.');

        const table = 'products';
        console.log(`Checking table: ${table}`);

        const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE 'sort_order'`);

        if (columns.length === 0) {
            console.log(`Adding sort_order to ${table}`);
            await sequelize.query(`ALTER TABLE ${table} ADD COLUMN sort_order INTEGER DEFAULT 0`);
        } else {
            console.log(`sort_order already exists in ${table}`);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
