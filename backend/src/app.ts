import express, { Request, Response } from 'express';
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
import uploadRoutes from './modules/system/upload.routes.js';

// Middleware - CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3014',
        'http://localhost:3000',
        'http://localhost:5171',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://ruveracouture.com',
        'https://admin.ruveracouture.com',
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        process.env.STORE_FRONT_URL
    ].filter(Boolean) as string[], // Filter out undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options(/.*/, cors());

app.use(express.json({
    limit: '50mb',
    verify: (_req: any, _res: any, buf: Buffer) => {
        (_req as any).rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/payment', paymentRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/coupons', couponRoutes);
app.use('/banners', bannerRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/settings', settingsRoutes);
app.use('/notifications', notificationRoutes);
app.use('/upload', uploadRoutes);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Database Connection and Server Start
const startServer = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        // Sync models
        // Note: { alter: true } caused ER_CANT_DROP_FIELD_OR_KEY error. 
        // Using default sync (CREATE IF NOT EXISTS) for stability.
        // await sequelize.sync({ alter: true }); 
        await sequelize.sync();
        console.log('Database synced.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
    console.trace('Exit trace');
});

const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error closing database connection:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
