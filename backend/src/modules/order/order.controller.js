import Order from './models/order.model.js';
import OrderItem from './models/order_item.model.js';
import Cart from './models/cart.model.js';
import CartItem from './models/cart_item.model.js';
import ProductVariant from '../catalog/models/product_variant.model.js';
import Product from '../catalog/models/product.model.js';
import Inventory from '../inventory/models/inventory.model.js';
import sequelize from '../../config/database.js';

export const createOrder = async (req, res) => {
    console.log("[OrderController] createOrder started for customer:", req.user.id);
    const t = await sequelize.transaction();
    try {
        const customer_id = req.user.id;
        const { shipping_address, billing_address, shipping_method_id } = req.body;
        console.log("[OrderController] Payload - shipping_address:", shipping_address);

        // Get Cart
        const cart = await Cart.findOne({
            where: { customer_id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: ProductVariant,
                            include: [Product]
                        }
                    ]
                }
            ],
            transaction: t
        });

        if (!cart || !cart.items.length) {
            console.warn("[OrderController] Cart is empty for customer:", customer_id);
            await t.rollback();
            return res.status(400).json({ message: 'Cart is empty' });
        }
        console.log("[OrderController] Cart found with", cart.items.length, "items");

        // Calculate Totals
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            const price = parseFloat(item.ProductVariant.variant_price) || parseFloat(item.ProductVariant.Product.base_price);
            const total = price * item.quantity;
            subtotal += total;

            orderItemsData.push({
                variant_id: item.variant_id,
                product_name: item.ProductVariant.Product.name,
                variant_sku: item.ProductVariant.sku,
                quantity: item.quantity,
                unit_price: price,
                total_price: total
            });

            // Check and Reserve Stock
            const inventory = await Inventory.findOne({
                where: { variant_id: item.variant_id },
                transaction: t,
                lock: true // Pessimistic lock to prevent race conditions
            });

            if (!inventory) {
                await t.rollback();
                return res.status(400).json({ message: `Inventory not found for ${item.ProductVariant.sku}` });
            }

            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < item.quantity) {
                await t.rollback();
                return res.status(400).json({ message: `Insufficient stock for ${item.ProductVariant.sku}. Available: ${available}` });
            }

            // Reserve stock
            console.log("[OrderController] Reserving stock for SKU:", item.ProductVariant.sku, "Qty:", item.quantity);
            inventory.reserved_quantity += item.quantity;
            await inventory.save({ transaction: t });
        }

        // Simple fixed shipping for now or fetch from DB
        const shipping_amount = 50.00;
        const tax_amount = subtotal * 0.18; // 18% GST example
        const total_amount = subtotal + shipping_amount + tax_amount;

        // Create Order
        const order = await Order.create({
            order_number: `ORD-${Date.now()}`,
            customer_id,
            subtotal,
            shipping_amount,
            tax_amount,
            total_amount,
            shipping_address,
            billing_address,
            shipping_method_id,
            status: 'pending'
        }, { transaction: t });

        // Create Order Items
        await OrderItem.bulkCreate(
            orderItemsData.map(item => ({ ...item, order_id: order.id })),
            { transaction: t }
        );

        // Clear Cart
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

        await t.commit();
        console.log("[OrderController] Order created successfully. Order Number:", order.order_number);

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        await t.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
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
