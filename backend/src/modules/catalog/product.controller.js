import Product from './models/product.model.js';
import Category from './models/category.model.js';
import Brand from './models/brand.model.js';
import ProductImage from './models/product_image.model.js';
import ProductVariant from './models/product_variant.model.js';
import Size from './models/size.model.js';
import Color from './models/color.model.js';
import Review from './models/review.model.js';
import Customer from '../identity/models/customer.model.js';
import Inventory from '../inventory/models/inventory.model.js';
import { Op } from 'sequelize';

export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category_slug, brand_slug, search, q, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};

        // Status filter logic
        if (status === 'all') {
            // No filter on is_active
        } else if (status === 'inactive') {
            where.is_active = false;
        } else {
            // Default to active only (backward compatibility)
            where.is_active = true;
        }

        const searchQuery = search || q;
        if (searchQuery) {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchQuery}%` } },
                { description: { [Op.like]: `%${searchQuery}%` } },
                { slug: { [Op.like]: `%${searchQuery}%` } }
            ];
        }

        const include = [
            { model: ProductImage, as: 'images', attributes: ['image_url', 'sort_order'] },
            { model: Category, as: 'Category', attributes: ['name', 'slug'] },
            {
                model: ProductVariant,
                as: 'variants',
                include: [
                    { model: Size, attributes: ['name', 'code'] },
                    { model: Color, attributes: ['name', 'hex_code'] },
                    { model: Inventory, attributes: ['quantity', 'reserved_quantity'] },
                ]
            }
        ];

        if (category_slug) {
            include.push({
                model: Category,
                as: 'Category',
                where: { slug: category_slug }
            });
        }

        if (brand_slug) {
            include.push({
                model: Brand,
                as: 'Brand',
                where: { slug: brand_slug }
            });
        }

        const products = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include,
            order: [['created_at', 'DESC']],
            distinct: true,
        });

        res.json({
            total: products.count,
            pages: Math.ceil(products.count / limit),
            currentPage: parseInt(page),
            data: products.rows,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                { model: ProductImage, as: 'images', attributes: ['image_url', 'sort_order'] },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [
                        { model: Size, attributes: ['name', 'code'] },
                        { model: Color, attributes: ['name', 'hex_code'] },
                        { model: Inventory, attributes: ['quantity', 'reserved_quantity'] },
                    ],
                    where: { is_active: true },
                    required: false,
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({
            where: { slug, is_active: true },
            include: [
                { model: ProductImage, as: 'images', attributes: ['image_url', 'sort_order'] },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [
                        { model: Size, attributes: ['name', 'code'] },
                        { model: Color, attributes: ['name', 'hex_code'] },
                        { model: Inventory, attributes: ['quantity', 'reserved_quantity'] },
                    ],
                    where: { is_active: true },
                    required: false,
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { mainImage, additionalImages, sizes, ...productData } = req.body;

        // Create the product with main image as featured_image
        const product = await Product.create({
            ...productData,
            featured_image: mainImage || null,
            slug: productData.name ? productData.name.toLowerCase().replace(/\s+/g, '-') : `product-${Date.now()}`
        });

        // Create ProductImage records for additional images
        if (additionalImages && Array.isArray(additionalImages)) {
            const imagePromises = additionalImages
                .filter(img => img && img.trim() !== '') // Filter out empty strings
                .map((imageUrl, index) =>
                    ProductImage.create({
                        product_id: product.id,
                        image_url: imageUrl,
                        sort_order: index + 1
                    })
                );

            await Promise.all(imagePromises);
        }

        // Handle Sizes -> create Variants and Inventory
        if (sizes && Array.isArray(sizes) && sizes.length > 0) {
            // Fetch size IDs
            const sizeRecords = await Size.findAll({
                where: { name: sizes }
            });
            console.log('Found sizeRecords:', sizeRecords.map(s => s.name));

            for (const size of sizeRecords) {
                // Generate SKU: CODE-SIZE (e.g., TS-001-S)
                const variantSku = `${productData.code || 'SKU'}-${size.code || size.name}`;

                // Create Variant
                const variant = await ProductVariant.create({
                    product_id: product.id,
                    sku: variantSku,
                    size_id: size.id,
                    color_id: null, // Default to null for now if not handled
                    variant_price: productData.price || 0,
                    variant_image: null
                });

                // Create Inventory
                await Inventory.create({
                    variant_id: variant.id,
                    quantity: 1,
                    reserved_quantity: 0,
                    low_stock_threshold: 10
                });
            }
        }

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { mainImage, additionalImages, sizes, ...productData } = req.body;

        // Find the product
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product fields including main image
        await product.update({
            ...productData,
            featured_image: mainImage !== undefined ? mainImage : product.featured_image,
            slug: productData.name ? productData.name.toLowerCase().replace(/\s+/g, '-') : product.slug
        });

        // Handle additional images update
        if (additionalImages && Array.isArray(additionalImages)) {
            // Delete existing additional images
            await ProductImage.destroy({ where: { product_id: id } });

            // Create new additional images
            const imagePromises = additionalImages
                .filter(img => img && img.trim() !== '')
                .map((imageUrl, index) =>
                    ProductImage.create({
                        product_id: id,
                        image_url: imageUrl,
                        sort_order: index + 1
                    })
                );

            await Promise.all(imagePromises);
        }

        // Handle Sizes Update
        if (sizes && Array.isArray(sizes)) {
            // Get existing variants
            const existingVariants = await ProductVariant.findAll({
                where: { product_id: id },
                include: [{ model: Size }]
            });

            const existingSizeNames = existingVariants.map(v => v.Size?.name).filter(Boolean);

            // 1. Identify Valid Variants (in payload) and New Variants
            const newSizes = sizes.filter(s => !existingSizeNames.includes(s));

            // 2. Identify Variants to Remove (exits in DB but NOT in payload)
            // Note: sizes contains Names, existingVariants has Size objects
            const variantsToRemove = existingVariants.filter(v => !sizes.includes(v.Size?.name));

            // Process Removals
            for (const variant of variantsToRemove) {
                try {
                    // Start transaction if possible, or just sequential
                    // First try to hard delete
                    await Inventory.destroy({ where: { variant_id: variant.id } });
                    await variant.destroy();
                } catch (delError) {
                    console.warn(`Could not hard-delete variant ${variant.sku}, falling back to deactivation.`);
                    // Fallback: Soft delete / Deactivate
                    await variant.update({ is_active: false });
                }
            }

            // Process Additions
            if (newSizes.length > 0) {
                const sizeRecords = await Size.findAll({
                    where: { name: newSizes }
                });

                for (const size of sizeRecords) {
                    const variantSku = `${productData.code || product.slug}-${size.code || size.name}`;

                    // Check if sku exists (paranoid check)
                    let variant = await ProductVariant.findOne({ where: { sku: variantSku } });

                    if (!variant) {
                        variant = await ProductVariant.create({
                            product_id: product.id,
                            sku: variantSku,
                            size_id: size.id,
                            color_id: null,
                            variant_price: productData.price || product.base_price,
                            variant_image: null
                        });

                        await Inventory.create({
                            variant_id: variant.id,
                            quantity: 1,
                            reserved_quantity: 0,
                            low_stock_threshold: 10
                        });
                    } else {
                        // Reactivate if it existed but was inactive
                        await variant.update({ is_active: true });
                    }
                }
            }
        }

        // Fetch updated product with images
        const updatedProduct = await Product.findByPk(id, {
            include: [{ model: ProductImage, as: 'images' }]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add update/delete as needed

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete associated images explicitly (safeguard)
        await ProductImage.destroy({ where: { product_id: id } });

        // Delete the product
        await product.destroy();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSizes = async (req, res) => {
    try {
        const sizes = await Size.findAll({
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
        res.json(sizes);
    } catch (error) {
        console.error('Error fetching sizes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { is_active: true },
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCategory = async (req, res) => {
    try {
        console.log('Received createCategory request:', req.body);
        const { name, slug, description, status } = req.body;

        // Ensure slug is unique if provided, or generated
        const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        console.log('Attempting to create category with slug:', finalSlug);

        const category = await Category.create({
            name,
            slug: finalSlug,
            description,
            is_active: status === 'Active'
        });

        console.log('Category created successfully:', category.id);
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        console.error('Validation errors:', error.errors); // Log sequelize validation errors specifically
        res.status(500).json({ message: 'Server error', error: error.message, details: error.errors });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, status } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.update({
            name,
            slug: slug || name.toLowerCase().replace(/ /g, '-'),
            description,
            is_active: status === 'Active'
        });

        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has products
        const productsCount = await Product.count({ where: { category_id: id } });
        if (productsCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. It has ${productsCount} associated products.`
            });
        }

        // Check if category has children
        const childrenCount = await Category.count({ where: { parent_id: id } });
        if (childrenCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. It has ${childrenCount} sub-categories.`
            });
        }

        await category.destroy();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { product_id: productId, status: 'approved' },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['first_name', 'last_name']
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProductReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, title, comment } = req.body;
        const customer_id = req.user.id;

        const review = await Review.create({
            product_id: productId,
            customer_id,
            rating,
            title,
            comment,
            status: 'approved' // Auto-approve for now
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addProductVariant = async (req, res) => {
    try {
        const { id: product_id } = req.params;
        const { sku, size_id, color_id, variant_price, variant_image } = req.body;

        // Check if SKU exists
        const existingVariant = await ProductVariant.findOne({ where: { sku } });
        if (existingVariant) {
            return res.status(400).json({ message: 'SKU already exists' });
        }

        // Create Variant
        const variant = await ProductVariant.create({
            product_id,
            sku,
            size_id: size_id || null,
            color_id: color_id || null,
            variant_price,
            variant_image
        });

        // Create Inventory Record for this variant
        await Inventory.create({
            variant_id: variant.id,
            quantity: 1,
            reserved_quantity: 0,
            low_stock_threshold: 10
        });

        res.status(201).json(variant);
    } catch (error) {
        console.error('Error adding variant:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteProductVariant = async (req, res) => {
    try {
        const { id, variantId } = req.params; // product id and variant id

        const variant = await ProductVariant.findOne({ where: { id: variantId, product_id: id } });
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        // Delete Inventory first
        await Inventory.destroy({ where: { variant_id: variantId } });

        // Delete Variant
        await variant.destroy();

        res.json({ message: 'Variant and stock deleted successfully' });
    } catch (error) {
        console.error('Error deleting variant:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
