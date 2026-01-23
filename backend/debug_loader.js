import fs from 'fs';

const modules = [
    './src/config/database.js',
    './src/modules/identity/auth.routes.js',
    './src/modules/identity/customer.routes.js',
    './src/modules/identity/wishlist.routes.js',
    './src/modules/catalog/product.routes.js',
    './src/modules/order/cart.routes.js',
    './src/modules/order/order.routes.js',
    './src/modules/payment/payment.routes.js',
    './src/modules/inventory/inventory.routes.js',
    './src/modules/marketing/coupon.routes.js',
    './src/modules/marketing/banner.routes.js',
    './src/modules/dashboard/dashboard.routes.js',
    './src/modules/system/settings.routes.js'
];

(async () => {
    const logVal = [];
    for (const mod of modules) {
        try {
            await import(mod);
            logVal.push(`Successfully loaded ${mod}`);
        } catch (e) {
            logVal.push(`Failed to load ${mod}: ${e.message}\n${e.stack}`);
        }
    }
    fs.writeFileSync('debug.log', logVal.join('\n'));
})();
