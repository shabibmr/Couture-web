import Wishlist from './models/wishlist.model.js';
import WishlistItem from './models/wishlist_item.model.js';
import Product from '../catalog/models/product.model.js';
import ProductImage from '../catalog/models/product_image.model.js';
import { getMinioUrl } from '../../utils/minio-url.js';
import { BUCKETS } from '../../config/minio.js';

export const getWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
        console.log(`[WishlistController] getWishlist called for customer: ${customer_id}`);

        let wishlist = await Wishlist.findOne({
            where: { customer_id },
            include: [
                {
                    model: WishlistItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            include: [{ model: ProductImage, as: 'images' }]
                        }
                    ]
                }
            ]
        });

        if (!wishlist) {
            console.log(`[WishlistController] No wishlist found for customer ${customer_id}, creating new one`);
            wishlist = await Wishlist.create({ customer_id });
            return res.json({ ...wishlist.toJSON(), items: [] });
        }

        console.log(`[WishlistController] Wishlist found with ${wishlist.items?.length || 0} items`);

        // Transform items to include full MinIO URL
        const wishlistJson = wishlist.toJSON();
        if (wishlistJson.items && wishlistJson.items.length > 0) {
            wishlistJson.items = wishlistJson.items.map(item => {
                if (item.Product) {
                    const product = item.Product;

                    if (product.featured_image) {
                        product.featured_image = getMinioUrl(product.featured_image, BUCKETS.PRODUCTS);
                    }
                    if (product.image) {
                        product.image = getMinioUrl(product.image, BUCKETS.PRODUCTS);
                    }

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

        res.json(wishlistJson);
    } catch (error) {
        console.error('[WishlistController] Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { product_id } = req.body;
        console.log(`[WishlistController] addToWishlist called:`, { customer_id, product_id });

        if (!product_id) {
            console.log('[WishlistController] Missing product_id in request');
            return res.status(400).json({ message: 'product_id is required' });
        }

        let wishlist = await Wishlist.findOne({ where: { customer_id } });
        if (!wishlist) {
            console.log(`[WishlistController] Creating new wishlist for customer ${customer_id}`);
            wishlist = await Wishlist.create({ customer_id });
        }

        // Check if product already exists
        const existingItem = await WishlistItem.findOne({
            where: { wishlist_id: wishlist.id, product_id }
        });

        if (existingItem) {
            console.log('[WishlistController] Product already in wishlist');
            return res.status(200).json({ message: 'Product already in wishlist', item: existingItem });
        }

        const item = await WishlistItem.create({
            wishlist_id: wishlist.id,
            product_id
        });

        console.log(`[WishlistController] ✓ Product added to wishlist:`, { item_id: item.id });
        res.status(201).json({ message: 'Product added to wishlist', item });
    } catch (error) {
        console.error('[WishlistController] Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { id } = req.params; // WishlistItem ID
        console.log(`[WishlistController] removeFromWishlist called:`, { customer_id, wishlist_item_id: id });

        const wishlist = await Wishlist.findOne({ where: { customer_id } });
        if (!wishlist) {
            console.log('[WishlistController] Wishlist not found for customer');
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const deleted = await WishlistItem.destroy({
            where: { id, wishlist_id: wishlist.id }
        });

        if (!deleted) {
            console.log('[WishlistController] Wishlist item not found');
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        console.log(`[WishlistController] ✓ Item removed from wishlist`);
        res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('[WishlistController] Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const clearWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;

        const wishlist = await Wishlist.findOne({ where: { customer_id } });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        await WishlistItem.destroy({ where: { wishlist_id: wishlist.id } });

        res.json({ message: 'Wishlist cleared' });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
