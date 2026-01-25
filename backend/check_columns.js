
import sequelize from './src/config/database.js';

const checkColumns = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const [results] = await sequelize.query("DESCRIBE settings");
        console.log('Columns:', results);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
};

checkColumns();
