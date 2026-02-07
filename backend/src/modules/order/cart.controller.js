import Cart from './models/cart.model.js';
import CartItem from './models/cart_item.model.js';
import ProductVariant from '../catalog/models/product_variant.model.js';
import Product from '../catalog/models/product.model.js';
import ProductImage from '../catalog/models/product_image.model.js';
import Inventory from '../inventory/models/inventory.model.js';
import Size from '../catalog/models/size.model.js';
import { getMinioUrl } from '../../utils/minio-url.js';
import { BUCKETS } from '../../config/minio.js';

export const getCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        let cart = await Cart.findOne({
            where: { customer_id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: ProductVariant,
                            include: [
                                {
                                    model: Product,
                                    include: [{ model: ProductImage, as: 'images' }]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            cart = await Cart.create({ customer_id });
            // Return empty cart structure with items array
            return res.json({ ...cart.toJSON(), items: [] });
        }

        // Transform cart items to include full MinIO URL for images
        const cartJson = cart.toJSON();
        if (cartJson.items && cartJson.items.length > 0) {
            cartJson.items = cartJson.items.map(item => {
                if (item.ProductVariant && item.ProductVariant.Product) {
                    const product = item.ProductVariant.Product;

                    // Transform main image/featured_image
                    if (product.featured_image) {
                        product.featured_image = getMinioUrl(product.featured_image, BUCKETS.PRODUCTS);
                    }
                    if (product.image) {
                        product.image = getMinioUrl(product.image, BUCKETS.PRODUCTS);
                    }

                    // Transform additional images if present
                    if (product.images && Array.isArray(product.images)) {
                        product.images = product.images.map(img => ({
                            ...img,
                            image_url: getMinioUrl(img.image_url, BUCKETS.PRODUCTS)
                        }));
                    }
                }
                return item;
            });
        }

        res.json(cartJson);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { variant_id, product_id, size, quantity } = req.body;

        let targetVariantId = variant_id;

        // Support product_id + size
        if (!targetVariantId && product_id && size) {
            const sizeRecord = await Size.findOne({ where: { name: size } });
            if (sizeRecord) {
                const variant = await ProductVariant.findOne({
                    where: {
                        product_id: product_id,
                        size_id: sizeRecord.id
                    }
                });
                if (variant) {
                    targetVariantId = variant.id;
                }
            }
        }

        if (!targetVariantId) {
            return res.status(400).json({ message: 'Product variant not found or invalid product/size combination' });
        }

        // Validate quantity
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        // Check inventory availability
        const inventory = await Inventory.findOne({
            where: { variant_id: targetVariantId }
        });

        if (!inventory) {
            return res.status(400).json({ message: 'Product variant not found' });
        }

        // Calculate available stock
        const availableStock = inventory.quantity - inventory.reserved_quantity;

        // Get current cart quantity for this variant
        let cart = await Cart.findOne({ where: { customer_id } });
        let currentCartQuantity = 0;

        if (cart) {
            const existingItem = await CartItem.findOne({
                where: { cart_id: cart.id, variant_id: targetVariantId }
            });
            currentCartQuantity = existingItem ? existingItem.quantity : 0;
        }

        // Check if requested quantity exceeds available stock
        const totalRequestedQuantity = currentCartQuantity + quantity;
        if (totalRequestedQuantity > availableStock) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${availableStock}, Already in cart: ${currentCartQuantity}`
            });
        }

        // Create cart if doesn't exist
        if (!cart) {
            cart = await Cart.create({ customer_id });
        }

        const [item, created] = await CartItem.findOrCreate({
            where: { cart_id: cart.id, variant_id: targetVariantId },
            defaults: { quantity }
        });

        if (!created) {
            item.quantity += quantity;
            await item.save();
        }

        res.status(200).json({ message: 'Item added to cart', item });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { id } = req.params; // CartItem ID
        const { quantity } = req.body;

        const cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = await CartItem.findOne({
            where: { id, cart_id: cart.id }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            await item.destroy();
            return res.json({ message: 'Item removed from cart' });
        }

        item.quantity = quantity;
        await item.save();

        res.json({ message: 'Cart item updated', item });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { id } = req.params;

        const cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const deleted = await CartItem.destroy({
            where: { id, cart_id: cart.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
