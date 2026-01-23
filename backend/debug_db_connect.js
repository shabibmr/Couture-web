import sequelize from './src/config/database.js';
import fs from 'fs';

(async () => {
    try {
        await sequelize.authenticate();
        fs.writeFileSync('debug_db.log', 'Connection has been established successfully.');
        await sequelize.close();
    } catch (error) {
        fs.writeFileSync('debug_db.log', `Unable to connect to the database: ${error.message}\n${JSON.stringify(error, null, 2)}`);
    }
})();
