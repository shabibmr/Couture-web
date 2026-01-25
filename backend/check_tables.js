
import sequelize from './src/config/database.js';

const checkTables = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('Tables:', results);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
};

checkTables();
