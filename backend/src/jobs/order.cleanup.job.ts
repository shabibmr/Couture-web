/**
 * Order Cleanup Job
 * 
 * Automatically expires pending orders older than 30 minutes
 * and releases their reserved inventory.
 * 
 * Runs every 5 minutes via node-cron.
 */

import cron from 'node-cron';
import { Op } from 'sequelize';
import Order from '../modules/order/models/order.model.js';
import OrderItem from '../modules/order/models/order_item.model.js';
import Inventory from '../modules/inventory/models/inventory.model.js';
import sequelize from '../config/database.js';

// Configuration
const EXPIRATION_MINUTES = 30;
const CRON_SCHEDULE = '*/5 * * * *'; // Every 5 minutes

/**
 * Release reserved inventory for order items
 */
async function releaseInventory(orderItems: any[], transaction: any): Promise<number> {
    let releasedCount = 0;

    for (const item of orderItems) {
        if (!item.variant_id) continue;

        const inventory = await Inventory.findOne({
            where: { variant_id: item.variant_id },
            lock: true,
            transaction
        }) as any;

        if (inventory && inventory.reserved_quantity >= item.quantity) {
            inventory.reserved_quantity -= item.quantity;
            await inventory.save({ transaction });
            releasedCount++;
        }
    }

    return releasedCount;
}

/**
 * Main cleanup function
 */
async function cleanupExpiredOrders(): Promise<void> {
    const expirationTime = new Date(Date.now() - EXPIRATION_MINUTES * 60 * 1000);

    console.log(`[OrderCleanup] Starting cleanup for orders pending before ${expirationTime.toISOString()}`);

    const t = await sequelize.transaction();

    try {
        // Find expired pending orders
        const expiredOrders = await Order.findAll({
            where: {
                status: 'pending',
                created_at: { [Op.lt]: expirationTime }
            },
            include: [{ model: OrderItem, as: 'items' }],
            transaction: t
        });

        if (expiredOrders.length === 0) {
            await t.commit();
            console.log('[OrderCleanup] No expired orders found');
            return;
        }

        console.log(`[OrderCleanup] Found ${expiredOrders.length} expired order(s)`);

        let totalInventoryReleased = 0;

        for (const order of expiredOrders) {
            const orderAny = order as any;
            // Release inventory
            const items = orderAny.items || [];
            const released = await releaseInventory(items, t);
            totalInventoryReleased += released;

            // Update order status
            await order.update({ status: 'expired' }, { transaction: t });

            console.log(`[OrderCleanup] Expired order ${orderAny.order_number}, released ${released} inventory items`);
        }

        await t.commit();
        console.log(`[OrderCleanup] Cleanup complete. Expired ${expiredOrders.length} orders, released ${totalInventoryReleased} inventory reservations`);

    } catch (error) {
        await t.rollback();
        console.error('[OrderCleanup] Error during cleanup:', error);
    }
}

/**
 * Start the cleanup job
 */
export function startOrderCleanupJob(): void {
    console.log(`[OrderCleanup] Scheduling job: every 5 minutes, expire orders older than ${EXPIRATION_MINUTES} minutes`);

    cron.schedule(CRON_SCHEDULE, () => {
        cleanupExpiredOrders().catch(err => {
            console.error('[OrderCleanup] Unhandled error in cleanup job:', err);
        });
    });

    // Also run once on startup (after a short delay to let DB connect)
    setTimeout(() => {
        console.log('[OrderCleanup] Running initial cleanup...');
        cleanupExpiredOrders().catch(err => {
            console.error('[OrderCleanup] Unhandled error in initial cleanup:', err);
        });
    }, 10000); // 10 seconds after startup
}

// Export for manual invocation (e.g., testing)
export { cleanupExpiredOrders };
