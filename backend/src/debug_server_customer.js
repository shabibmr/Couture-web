import express from 'express';
import sequelize from './config/database.js';
import customerRoutes from './modules/identity/customer.routes.js';

const app = express();
app.use(express.json());

app.use('/api/customers', customerRoutes);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        app.listen(5004, () => {
            console.log('Server is running on port 5004');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

startServer();
