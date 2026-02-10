import Order from './models/order.model.js';
import OrderItem from './models/order_item.model.js';
import Cart from './models/cart.model.js';
import CartItem from './models/cart_item.model.js';
import ProductVariant from '../catalog/models/product_variant.model.js';
import Product from '../catalog/models/product.model.js';
import Inventory from '../inventory/models/inventory.model.js';
import Size from '../catalog/models/size.model.js';
import Setting from '../system/settings.model.js';
import Customer from '../identity/models/customer.model.js';
import PaymentTransaction from '../payment/models/payment_transaction.model.js';
import PaymentGateway from '../payment/models/payment_gateway.model.js';
import Coupon from '../marketing/models/coupon.model.js';
import CouponUsage from '../marketing/models/coupon_usage.model.js';
import CouponService from '../marketing/services/coupon.service.js';
import Shipment from './models/shipment.model.js';
import Refund from '../payment/models/refund.model.js';
import sequelize from '../../config/database.js';
import { getMinioUrl } from '../../utils/minio-url.js';
import { BUCKETS } from '../../config/minio.js';


export const createOrder = async (req, res) => {
    console.log("[OrderController] createOrder started for customer:", req.user.id);
    const t = await sequelize.transaction();
    try {
        const customer_id = req.user.id;
        const {
            shipping_address,
            billing_address,
            shipping_method_id,
            items,
            payment_method,
            currency,
            coupon_code,
            coupon_codes  // Support for multiple coupons
        } = req.body;
        console.log("[OrderController] Payload - items count:", items ? items.length : 0);

        let orderItemsData = [];
        let itemsSource = 'payload'; // 'payload' or 'cart'

        // 1. Resolve Items (from Payload or Cart)
        if (items && Array.isArray(items) && items.length > 0) {
            // OPTIMIZED: Bulk fetch sizes and variants to avoid N+1 queries

            // Step 1: Collect all unique size names and variant IDs
            const sizeNames = [...new Set(items.filter(item => item.size).map(item => item.size))];
            const directVariantIds = items.filter(item => item.variant_id).map(item => item.variant_id);

            // Step 2: Bulk fetch all sizes
            const sizes = await Size.findAll({
                where: { name: { [sequelize.Sequelize.Op.in]: sizeNames } }
            });
            const sizeMap = new Map(sizes.map(s => [s.name, s]));

            // Step 3: Build variant lookup conditions
            const variantLookups = items
                .filter(item => !item.variant_id && item.product_id && item.size)
                .map(item => {
                    const size = sizeMap.get(item.size);
                    return size ? { product_id: item.product_id, size_id: size.id } : null;
                })
                .filter(Boolean);

            // Step 4: Bulk fetch all variants (both direct and resolved)
            const allVariantIds = [...directVariantIds];

            if (variantLookups.length > 0) {
                const resolvedVariants = await ProductVariant.findAll({
                    where: {
                        [sequelize.Sequelize.Op.or]: variantLookups
                    }
                });
                allVariantIds.push(...resolvedVariants.map(v => v.id));

                // Create lookup map for resolved variants
                var resolvedVariantMap = new Map(
                    resolvedVariants.map(v => [`${v.product_id}_${v.size_id}`, v.id])
                );
            }

            // Step 5: Bulk fetch all variant details with products
            const variants = await ProductVariant.findAll({
                where: { id: { [sequelize.Sequelize.Op.in]: allVariantIds } },
                include: [Product]
            });
            const variantMap = new Map(variants.map(v => [v.id, v]));

            // Step 6: Process items and build orderItemsData
            for (const item of items) {
                let variantId = item.variant_id;

                // Resolve variant ID if not provided
                if (!variantId && item.product_id && item.size) {
                    const size = sizeMap.get(item.size);
                    if (size) {
                        const lookupKey = `${item.product_id}_${size.id}`;
                        variantId = resolvedVariantMap?.get(lookupKey);
                    }
                }

                if (!variantId) {
                    throw new Error(`Could not identify product variant for item: ${item.product_id} / ${item.size}`);
                }

                const variantData = variantMap.get(variantId);
                if (!variantData) {
                    throw new Error(`Variant not found: ${variantId}`);
                }

                const price = parseFloat(variantData.variant_price) ||
                             parseFloat(variantData.Product.sale_price) ||
                             parseFloat(variantData.Product.base_price);

                orderItemsData.push({
                    variant_id: variantId,
                    product_id: variantData.product_id,
                    product_name: variantData.Product.name,
                    variant_sku: variantData.sku,
                    quantity: item.quantity,
                    unit_price: price,
                    total_price: price * item.quantity,
                    size: item.size,
                    category_id: variantData.Product.category_id
                });
            }
        } else {
            // Fallback to Cart
            itemsSource = 'cart';
            const cart = await Cart.findOne({
                where: { customer_id },
                include: [{
                    model: CartItem,
                    as: 'items',
                    include: [{
                        model: ProductVariant,
                        include: [Product, Size] // Include Size to map name
                    }]
                }],
                transaction: t
            });

            if (!cart || !cart.items || cart.items.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: 'No items in order or cart' });
            }

            for (const item of cart.items) {
                const price = parseFloat(item.ProductVariant.variant_price) || parseFloat(item.ProductVariant.Product.sale_price) || parseFloat(item.ProductVariant.Product.base_price);

                orderItemsData.push({
                    variant_id: item.variant_id,
                    product_id: item.ProductVariant.product_id,
                    product_name: item.ProductVariant.Product.name,
                    variant_sku: item.ProductVariant.sku,
                    quantity: item.quantity,
                    unit_price: price,
                    total_price: price * item.quantity,
                    size: item.ProductVariant.Size?.name,
                    category_id: item.ProductVariant.Product.category_id
                });
            }
        }

        // 2. Process Inventory Reservation & Validation
        // OPTIMIZED: Bulk fetch and update inventory

        // Calculate subtotal
        let subtotal = 0;
        for (const item of orderItemsData) {
            subtotal += item.total_price;
        }

        // Bulk fetch all inventory records with pessimistic lock
        const variantIds = orderItemsData.map(item => item.variant_id);
        const inventories = await Inventory.findAll({
            where: { variant_id: { [sequelize.Sequelize.Op.in]: variantIds } },
            transaction: t,
            lock: true // Pessimistic lock for entire batch
        });

        // Create inventory map for fast lookup
        const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

        // Validate stock availability
        for (const item of orderItemsData) {
            const inventory = inventoryMap.get(item.variant_id);

            if (!inventory) {
                throw new Error(`Inventory not found for ${item.variant_sku}`);
            }

            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < item.quantity) {
                throw new Error(`Insufficient stock for ${item.variant_sku}. Available: ${available}`);
            }

            // Update reserved quantity in memory
            inventory.reserved_quantity += item.quantity;
        }

        // Bulk save all inventory updates
        await Promise.all(
            Array.from(inventoryMap.values()).map(inv => inv.save({ transaction: t }))
        );

        // 3. Calculate Totals w/ Coupon Logic
        // Fetch shipping settings from database
        const settingsData = await Setting.findAll();
        const settings = {};
        settingsData.forEach(s => { settings[s.key] = s.value; });

        const baseShippingFee = settings.shipping_fee !== undefined && settings.shipping_fee !== null
            ? parseFloat(settings.shipping_fee)
            : 0.00;
        const freeShippingThreshold = settings.free_shipping_threshold !== undefined && settings.free_shipping_threshold !== null
            ? parseFloat(settings.free_shipping_threshold)
            : 0;

        // Apply free shipping logic - free if subtotal exceeds threshold
        let shipping_amount = (subtotal >= freeShippingThreshold && freeShippingThreshold > 0)
            ? 0
            : baseShippingFee;

        const tax_amount = 0; // Tax removed as per requirement
        let discount_amount = 0;
        let appliedCouponIds = [];

        // --- COUPON VALIDATION (supports single or multiple) ---
        // Normalize to array for unified handling
        const allCouponCodes = coupon_codes && Array.isArray(coupon_codes) && coupon_codes.length > 0
            ? coupon_codes
            : (coupon_code ? [coupon_code] : []);

        if (allCouponCodes.length > 0) {
            console.log(`[OrderController] Validating ${allCouponCodes.length} coupon(s): ${allCouponCodes.join(', ')}`);

            const validationResult = allCouponCodes.length === 1
                ? await CouponService.validateCoupon(allCouponCodes[0], {
                    customerId: customer_id,
                    cartTotal: subtotal,
                    items: orderItemsData
                })
                : await CouponService.validateMultipleCoupons(allCouponCodes, {
                    customerId: customer_id,
                    cartTotal: subtotal,
                    items: orderItemsData
                });

            if (!validationResult.isValid) {
                await t.rollback();
                return res.status(400).json({
                    message: `Coupon validation failed: ${validationResult.message}`
                });
            }

            // Handle single vs multiple coupon response
            if (allCouponCodes.length === 1 && validationResult.coupon) {
                appliedCouponIds = [validationResult.coupon.id];
            } else if (validationResult.coupons) {
                appliedCouponIds = validationResult.coupons.map(c => c.id);
            }

            discount_amount = validationResult.discountAmount;

            // Override shipping if coupon gives free shipping
            if (validationResult.freeShipping) {
                shipping_amount = 0;
            }

            console.log(`[OrderController] Coupons Applied. Count: ${appliedCouponIds.length}, Discount: ${discount_amount}, Free Shipping: ${validationResult.freeShipping}`);
        }
        // -------------------------

        const total_amount = Math.max(0, subtotal + shipping_amount + tax_amount - discount_amount);

        // 4. Create Order
        const order = await Order.create({
            order_number: `ORD-${Date.now()}`,
            customer_id,
            subtotal,
            shipping_amount,
            tax_amount,
            discount_amount,
            total_amount,
            shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
            billing_address: typeof billing_address === 'string' ? billing_address : JSON.stringify(billing_address),
            shipping_method_id,
            coupon_code: allCouponCodes.length > 0 ? JSON.stringify(allCouponCodes) : null,
            status: 'pending'
        }, { transaction: t });

        // 5. Create Order Items
        await OrderItem.bulkCreate(
            orderItemsData.map(item => ({
                order_id: order.id,
                variant_id: item.variant_id,
                product_name: item.product_name,
                variant_sku: item.variant_sku,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price
            })),
            { transaction: t }
        );

        // 6. Record Coupon Usage (Atomic with Order Creation)
        if (appliedCouponIds.length > 0) {
            await CouponService.recordMultipleUsage(appliedCouponIds, customer_id, order.id, t);
            console.log(`[OrderController] Coupon usage recorded for ${appliedCouponIds.length} coupon(s) on Order ${order.id}`);
        }

        // 7. Clear Cart (Always clear cart if order placed successfully)
        const customerCart = await Cart.findOne({
            where: { customer_id },
            transaction: t
        });
        if (customerCart) {
            await CartItem.destroy({
                where: { cart_id: customerCart.id },
                transaction: t
            });
        }

        await t.commit();
        console.log("[OrderController] Order created successfully:", order.order_number);

        // Return full order details

        // Return full order details
        const createdOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json({ message: 'Order created successfully', order: createdOrder });
    } catch (error) {
        await t.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const user = req.user;
        let where = {};

        // If not admin, filter by customer_id
        if (user.type !== 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
            where = { customer_id: user.id };
        }

        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const orders = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sequelize.literal('`Order`.`order_date`'), 'DESC']],
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: ProductVariant,
                        include: [Product]
                    }]
                },
                {
                    model: Customer,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: PaymentTransaction,
                    include: [{
                        model: PaymentGateway,
                        attributes: ['name', 'code']
                    }]
                }
            ],
            distinct: true
        });

        // Map orders to include item images
        const mappedOrders = orders.rows.map(order => {
            const orderJson = order.toJSON();
            orderJson.items = (orderJson.items || []).map(item => {
                const product = item.ProductVariant?.Product || {};
                let imageUrl = item.ProductVariant?.variant_image || product.image || product.featured_image || '';

                // Transform to full URL
                if (imageUrl) {
                    imageUrl = getMinioUrl(imageUrl, BUCKETS.PRODUCTS);
                }

                return {
                    ...item,
                    image: imageUrl,
                };
            });
            return orderJson;
        });

        res.json({
            total: orders.count,
            pages: Math.ceil(orders.count / limit),
            currentPage: parseInt(page),
            data: mappedOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer_id = req.user.id;

        const order = await Order.findOne({
            where: { id, customer_id },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: ProductVariant,
                        include: [Product]
                    }]
                },
                {
                    model: Customer,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: PaymentTransaction,
                    include: [{
                        model: PaymentGateway,
                        attributes: ['name', 'code']
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderJson = order.toJSON();
        orderJson.items = (orderJson.items || []).map(item => {
            const product = item.ProductVariant?.Product || {};
            let imageUrl = item.ProductVariant?.variant_image || product.image || product.featured_image || '';

            // Transform to full URL
            if (imageUrl) {
                imageUrl = getMinioUrl(imageUrl, BUCKETS.PRODUCTS);
            }

            return {
                ...item,
                image: imageUrl,
            };
        });

        res.json(orderJson);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin-specific endpoint to get any order without customer filter
export const getOrderByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: ProductVariant,
                        include: [Product]
                    }]
                },
                {
                    model: Customer,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: PaymentTransaction,
                    include: [{
                        model: PaymentGateway,
                        attributes: ['name', 'code']
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderJson = order.toJSON();
        orderJson.items = (orderJson.items || []).map(item => {
            const product = item.ProductVariant?.Product || {};
            let imageUrl = item.ProductVariant?.variant_image || product.image || product.featured_image || '';

            // Transform to full URL
            if (imageUrl) {
                imageUrl = getMinioUrl(imageUrl, BUCKETS.PRODUCTS);
            }

            return {
                ...item,
                image: imageUrl,
            };
        });

        res.json(orderJson);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // status: 'confirmed', 'shipped', 'delivered', 'cancelled'

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Add additional logic here if needed, e.g., checking transitions
        // e.g., cannot go from 'delivered' to 'pending'

        if (status) {
            // Include Order Items to manage their stock
            const orderWithItems = await Order.findByPk(id, {
                include: [{ model: OrderItem, as: 'items' }]
            });

            const oldStatus = order.status;

            // Start transaction for stock updates
            const t = await sequelize.transaction();
            try {
                // OPTIMIZED: Bulk fetch and update inventory
                const variantIds = orderWithItems.items.map(item => item.variant_id);
                const inventories = await Inventory.findAll({
                    where: { variant_id: { [sequelize.Sequelize.Op.in]: variantIds } },
                    transaction: t
                });

                // Create inventory map for fast lookup
                const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

                if (status === 'cancelled' && oldStatus !== 'cancelled') {
                    // Release reserved stock
                    for (const item of orderWithItems.items) {
                        const inventory = inventoryMap.get(item.variant_id);
                        if (inventory) {
                            inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
                        }
                    }
                } else if (status === 'shipped' && oldStatus === 'pending') {
                    // Finalize stock: remove from quantity and reserved
                    for (const item of orderWithItems.items) {
                        const inventory = inventoryMap.get(item.variant_id);
                        if (inventory) {
                            inventory.quantity = Math.max(0, inventory.quantity - item.quantity);
                            inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
                        }
                    }
                }

                // Bulk save all inventory updates
                await Promise.all(
                    Array.from(inventoryMap.values()).map(inv => inv.save({ transaction: t }))
                );

                order.status = status;
                await order.save({ transaction: t });
                await t.commit();
            } catch (err) {
                await t.rollback();
                throw err;
            }
        } else {
            await order.save();
        }

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction: t
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log(`[DeleteOrder] Starting deletion for order ${order.order_number || id}`);

        // 1. Restore inventory if order was in pending/reserved state
        // OPTIMIZED: Bulk fetch and update inventory
        if (order.status === 'pending' && order.items && order.items.length > 0) {
            const variantIds = order.items.map(item => item.variant_id);
            const inventories = await Inventory.findAll({
                where: { variant_id: { [sequelize.Sequelize.Op.in]: variantIds } },
                transaction: t
            });

            // Create inventory map for fast lookup
            const inventoryMap = new Map(inventories.map(inv => [inv.variant_id, inv]));

            // Update reserved quantities in memory
            for (const item of order.items) {
                const inventory = inventoryMap.get(item.variant_id);
                if (inventory) {
                    inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
                    console.log(`[DeleteOrder] Restored ${item.quantity} units for variant ${item.variant_id}`);
                }
            }

            // Bulk save all inventory updates
            await Promise.all(
                Array.from(inventoryMap.values()).map(inv => inv.save({ transaction: t }))
            );
        }

        // 2. Delete PaymentTransactions (must be deleted before order)
        const deletedPayments = await PaymentTransaction.destroy({
            where: { order_id: id },
            transaction: t
        });
        console.log(`[DeleteOrder] Deleted ${deletedPayments} payment transaction(s)`);

        // 3. Delete CouponUsages (must be deleted before order)
        const deletedCoupons = await CouponUsage.destroy({
            where: { order_id: id },
            transaction: t
        });
        console.log(`[DeleteOrder] Deleted ${deletedCoupons} coupon usage(s)`);

        // 4. Delete Shipments (must be deleted before order)
        const deletedShipments = await Shipment.destroy({
            where: { order_id: id },
            transaction: t
        });
        console.log(`[DeleteOrder] Deleted ${deletedShipments} shipment(s)`);

        // 5. Delete Refunds (must be deleted before order)
        const deletedRefunds = await Refund.destroy({
            where: { order_id: id },
            transaction: t
        });
        console.log(`[DeleteOrder] Deleted ${deletedRefunds} refund(s)`);

        // 6. Delete OrderItems (must be deleted before order)
        const deletedItems = await OrderItem.destroy({
            where: { order_id: id },
            transaction: t
        });
        console.log(`[DeleteOrder] Deleted ${deletedItems} order item(s)`);

        // 7. Finally, delete the Order
        await order.destroy({ transaction: t });
        console.log(`[DeleteOrder] Order ${order.order_number || id} deleted successfully`);

        await t.commit();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('[DeleteOrder] Error deleting order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
