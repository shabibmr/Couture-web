import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
import authRoutes from './modules/identity/auth.routes.js';
import customerRoutes from './modules/identity/customer.routes.js';
import wishlistRoutes from './modules/identity/wishlist.routes.js';
import productRoutes from './modules/catalog/product.routes.js';
import cartRoutes from './modules/order/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import couponRoutes from './modules/marketing/coupon.routes.js';
import bannerRoutes from './modules/marketing/banner.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import settingsRoutes from './modules/system/settings.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync models (disable in production or use migrations)
        // await sequelize.sync(); 

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
