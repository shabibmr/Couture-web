/**
 * Inventory Service
 * Manages inventory operations: reserve, release, and finalize stock
 */

import { Op } from 'sequelize';
import Inventory from '../../inventory/models/inventory.model.js';
import { ERROR_MESSAGES } from '../constants/order.constants.js';

class InventoryService {
    /**
     * Reserve stock for order items
     * @param {Array} orderItems - Array of order items with variant_id and quantity
     * @param {Object} transaction - Sequelize transaction
     * @throws {Error} If insufficient stock or inventory not found
     */
    async reserveStock(orderItems, transaction) {
        // Bulk fetch all inventory records with pessimistic lock
        const variantIds = orderItems.map(item => item.variant_id);
        const inventories = await Inventory.findAll({
            where: { variant_id: { [Op.in]: variantIds } },
            transaction,
            lock: true // Pessimistic lock for entire batch
        });

        // Create inventory map for fast lookup
        const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

        // Validate stock availability and reserve
        for (const item of orderItems) {
            const inventory = inventoryMap.get(item.variant_id);

            if (!inventory) {
                throw new Error(`${ERROR_MESSAGES.INVENTORY_NOT_FOUND} for ${item.variant_sku || item.variant_id}`);
            }

            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < item.quantity) {
                throw new Error(
                    `${ERROR_MESSAGES.INSUFFICIENT_STOCK} for ${item.variant_sku || item.variant_id}. ` +
                    `Available: ${available}, Requested: ${item.quantity}`
                );
            }

            // Update reserved quantity in memory
            inventory.reserved_quantity += item.quantity;
        }

        // Bulk save all inventory updates
        await Promise.all(
            Array.from(inventoryMap.values()).map(inv => inv.save({ transaction }))
        );

        return true;
    }

    /**
     * Release reserved stock (e.g., when order is cancelled)
     * @param {Array} orderItems - Array of order items with variant_id and quantity
     * @param {Object} transaction - Sequelize transaction
     */
    async releaseStock(orderItems, transaction) {
        // Bulk fetch all inventory records
        const variantIds = orderItems.map(item => item.variant_id);
        const inventories = await Inventory.findAll({
            where: { variant_id: { [Op.in]: variantIds } },
            transaction
        });

        // Create inventory map for fast lookup
        const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

        // Release reserved stock
        for (const item of orderItems) {
            const inventory = inventoryMap.get(item.variant_id);
            if (inventory) {
                inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
            }
        }

        // Bulk save all inventory updates
        await Promise.all(
            Array.from(inventoryMap.values()).map(inv => inv.save({ transaction }))
        );

        return true;
    }

    /**
     * Finalize stock (deduct from quantity and reserved when order is shipped)
     * @param {Array} orderItems - Array of order items with variant_id and quantity
     * @param {Object} transaction - Sequelize transaction
     */
    async finalizeStock(orderItems, transaction) {
        // Bulk fetch all inventory records
        const variantIds = orderItems.map(item => item.variant_id);
        const inventories = await Inventory.findAll({
            where: { variant_id: { [Op.in]: variantIds } },
            transaction
        });

        // Create inventory map for fast lookup
        const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

        // Finalize stock: remove from both quantity and reserved
        for (const item of orderItems) {
            const inventory = inventoryMap.get(item.variant_id);
            if (inventory) {
                inventory.quantity = Math.max(0, inventory.quantity - item.quantity);
                inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
            }
        }

        // Bulk save all inventory updates
        await Promise.all(
            Array.from(inventoryMap.values()).map(inv => inv.save({ transaction }))
        );

        return true;
    }

    /**
     * Check stock availability for items
     * @param {Array} orderItems - Array of items with variant_id and quantity
     * @returns {Object} { available: boolean, insufficientItems: Array }
     */
    async checkStockAvailability(orderItems) {
        const variantIds = orderItems.map(item => item.variant_id);
        const inventories = await Inventory.findAll({
            where: { variant_id: { [Op.in]: variantIds } }
        });

        const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));
        const insufficientItems = [];

        for (const item of orderItems) {
            const inventory = inventoryMap.get(item.variant_id);
            if (!inventory) {
                insufficientItems.push({
                    ...item,
                    reason: 'Inventory not found',
                    available: 0
                });
                continue;
            }

            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < item.quantity) {
                insufficientItems.push({
                    ...item,
                    reason: 'Insufficient stock',
                    available,
                    requested: item.quantity
                });
            }
        }

        return {
            available: insufficientItems.length === 0,
            insufficientItems
        };
    }

    /**
     * Get inventory for multiple variants
     * @param {Array} variantIds - Array of variant IDs
     * @returns {Map} Map of variant_id to inventory record
     */
    async getInventoryForVariants(variantIds) {
        const inventories = await Inventory.findAll({
            where: { variant_id: { [Op.in]: variantIds } }
        });

        return new Map(inventories.map(inv => [inv.variant_id, inv]));
    }
}

export default new InventoryService();
