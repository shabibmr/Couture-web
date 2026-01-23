import Wishlist from './models/wishlist.model.js';
import WishlistItem from './models/wishlist_item.model.js';
import Product from '../catalog/models/product.model.js';
import ProductImage from '../catalog/models/product_image.model.js';

export const getWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
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
            wishlist = await Wishlist.create({ customer_id });
            return res.json({ ...wishlist.toJSON(), items: [] });
        }

        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: 'product_id is required' });
        }

        let wishlist = await Wishlist.findOne({ where: { customer_id } });
        if (!wishlist) {
            wishlist = await Wishlist.create({ customer_id });
        }

        // Check if product already exists
        const existingItem = await WishlistItem.findOne({
            where: { wishlist_id: wishlist.id, product_id }
        });

        if (existingItem) {
            return res.status(200).json({ message: 'Product already in wishlist', item: existingItem });
        }

        const item = await WishlistItem.create({
            wishlist_id: wishlist.id,
            product_id
        });

        res.status(201).json({ message: 'Product added to wishlist', item });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { id } = req.params; // WishlistItem ID

        const wishlist = await Wishlist.findOne({ where: { customer_id } });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const deleted = await WishlistItem.destroy({
            where: { id, wishlist_id: wishlist.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
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
