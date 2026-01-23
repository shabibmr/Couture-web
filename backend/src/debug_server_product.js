import express from 'express';
import sequelize from './config/database.js';
import productRoutes from './modules/catalog/product.routes.js';

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        app.listen(5005, () => {
            console.log('Server is running on port 5005');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

startServer();
