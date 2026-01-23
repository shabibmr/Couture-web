import express from 'express';
import sequelize from './config/database.js';

import wishlistRoutes from './modules/identity/wishlist.routes.js';
import productRoutes from './modules/catalog/product.routes.js';

const app = express();
app.use(express.json());

app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        app.listen(5002, () => {
            console.log('Server is running on port 5002');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

startServer();
