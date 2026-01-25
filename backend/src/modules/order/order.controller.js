import Order from './models/order.model.js';
import OrderItem from './models/order_item.model.js';
import Cart from './models/cart.model.js';
import CartItem from './models/cart_item.model.js';
import ProductVariant from '../catalog/models/product_variant.model.js';
import Product from '../catalog/models/product.model.js';
import Inventory from '../inventory/models/inventory.model.js';
import Size from '../catalog/models/size.model.js';
import sequelize from '../../config/database.js';

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
            coupon_code
        } = req.body;
        console.log("[OrderController] Payload - items count:", items ? items.length : 0);

        let orderItemsData = [];
        let itemsSource = 'payload'; // 'payload' or 'cart'

        // 1. Resolve Items (from Payload or Cart)
        if (items && Array.isArray(items) && items.length > 0) {
            // Use provided items
            for (const item of items) {
                let variantId = item.variant_id;

                // Resolve variant if missing
                if (!variantId && item.product_id && item.size) {
                    const sizeRecord = await Size.findOne({ where: { name: item.size } });
                    if (sizeRecord) {
                        const variant = await ProductVariant.findOne({
                            where: { product_id: item.product_id, size_id: sizeRecord.id }
                        });
                        if (variant) variantId = variant.id;
                    }
                }

                if (!variantId) {
                    throw new Error(`Could not identify product variant for item: ${item.product_id} / ${item.size}`);
                }

                // Fetch Variant Details for Pricing (Security)
                const variantData = await ProductVariant.findByPk(variantId, {
                    include: [Product]
                });

                if (!variantData) {
                    throw new Error(`Variant not found: ${variantId}`);
                }

                const price = parseFloat(variantData.variant_price) || parseFloat(variantData.Product.sale_price) || parseFloat(variantData.Product.base_price);

                orderItemsData.push({
                    variant_id: variantId,
                    product_id: variantData.product_id, // Ensure we store product_id
                    product_name: variantData.Product.name,
                    variant_sku: variantData.sku,
                    quantity: item.quantity,
                    unit_price: price, // Use DB price, ignore frontend price
                    total_price: price * item.quantity,
                    size: item.size
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
                    size: item.ProductVariant.Size?.name // Map size name for legacy/consistency
                });
            }
        }

        // 2. Process Inventory Reservation & Validation
        let subtotal = 0;
        for (const item of orderItemsData) {
            subtotal += item.total_price;

            // Check and Reserve Stock
            const inventory = await Inventory.findOne({
                where: { variant_id: item.variant_id },
                transaction: t,
                lock: true // Pessimistic lock
            });

            if (!inventory) {
                throw new Error(`Inventory not found for ${item.variant_sku}`);
            }

            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < item.quantity) {
                throw new Error(`Insufficient stock for ${item.variant_sku}. Available: ${available}`);
            }

            // Reserve stock
            inventory.reserved_quantity += item.quantity;
            await inventory.save({ transaction: t });
        }

        // 3. Calculate Totals
        // Simple fixed taxes/shipping for now (or strictly match existing logic)
        const shipping_amount = 50.00; // Fixed for now, could be dynamic
        const tax_amount = subtotal * 0.18; // 18% GST default
        let discount_amount = 0; // Handle coupon logic if needed (skipped for phase 1 direct port)

        // If frontend provided discount/coupon, we really should validate it. 
        // For Phase 1, we will just recalculate based on simple rules to be safe.
        // If payment gateway authorized a specific amount, we should match it?
        // Let's stick to trusted backend calculation.

        const total_amount = subtotal + shipping_amount + tax_amount - discount_amount;

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
            payment_method: payment_method || 'razorpay',
            currency_code: currency || 'INR',
            coupon_code: coupon_code || null,
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
                // Note: OrderItem model might not have product_id/size columns based on schema,
                // checking schema... ACTUAL_DB_SCHEMA says OrderItem has: 
                // order_id, variant_id, product_name, variant_sku, quantity, unit_price, total_price.
                // It does NOT have product_id or size. So we omit them.
            })),
            { transaction: t }
        );

        // 6. Clear Cart (Always clear cart if order placed successfully)
        await CartItem.destroy({
            where: {
                cart_id: { [sequelize.Sequelize.Op.in]: sequelize.literal(`(SELECT id FROM carts WHERE customer_id = '${customer_id}')`) }
            },
            transaction: t
        });

        await t.commit();
        console.log("[OrderController] Order created successfully:", order.order_number);

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
            order: [['created_at', 'DESC']],
            include: [{ model: OrderItem, as: 'items' }],
            distinct: true
        });

        res.json({
            total: orders.count,
            pages: Math.ceil(orders.count / limit),
            currentPage: parseInt(page),
            data: orders.rows
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
            include: [{ model: OrderItem, as: 'items' }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
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
                if (status === 'cancelled' && oldStatus !== 'cancelled') {
                    // Release reserved stock
                    for (const item of orderWithItems.items) {
                        const inventory = await Inventory.findOne({
                            where: { variant_id: item.variant_id },
                            transaction: t
                        });
                        if (inventory) {
                            inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
                            await inventory.save({ transaction: t });
                        }
                    }
                } else if (status === 'shipped' && oldStatus === 'pending') {
                    // Finalize stock: remove from quantity and reserved
                    for (const item of orderWithItems.items) {
                        const inventory = await Inventory.findOne({
                            where: { variant_id: item.variant_id },
                            transaction: t
                        });
                        if (inventory) {
                            inventory.quantity = Math.max(0, inventory.quantity - item.quantity);
                            inventory.reserved_quantity = Math.max(0, inventory.reserved_quantity - item.quantity);
                            await inventory.save({ transaction: t });
                        }
                    }
                }

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
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete associated order items first
        await OrderItem.destroy({ where: { order_id: id } });

        await order.destroy();

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
