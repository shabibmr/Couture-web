import { Op } from 'sequelize';
import Coupon from '../models/coupon.model.js';
import CouponUsage from '../models/coupon_usage.model.js';
import Order from '../../order/models/order.model.js';

class CouponValidationService {
    /**
     * Fetch multiple coupons by codes in a single query
     * @param {string[]} codes - Array of coupon codes
     * @returns {Promise<Array>} Array of active, valid coupons
     */
    async fetchCouponsByCodes(codes) {
        if (!codes || codes.length === 0) return [];

        return await Coupon.findAll({
            where: {
                code: { [Op.in]: codes },
                is_active: true,
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() }
            }
        });
    }

    /**
     * Fetch customer usage data for multiple coupons in parallel
     * @param {string[]} couponIds - Array of coupon IDs
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>} { usageMap, orderCount }
     */
    async fetchCustomerUsageData(couponIds, customerId) {
        if (!customerId || !couponIds || couponIds.length === 0) {
            return { usageMap: new Map(), orderCount: 0 };
        }

        // Parallel queries: usage counts and order count
        const [usageCounts, orderCount] = await Promise.all([
            CouponUsage.count({
                where: {
                    coupon_id: { [Op.in]: couponIds },
                    customer_id: customerId
                },
                group: ['coupon_id']
            }),
            Order.count({ where: { customer_id: customerId } })
        ]);

        // Convert usage counts to Map for O(1) lookup
        const usageMap = new Map();
        if (Array.isArray(usageCounts)) {
            usageCounts.forEach(item => {
                usageMap.set(item.coupon_id, parseInt(item.count) || 0);
            });
        }

        return { usageMap, orderCount };
    }

    /**
     * Pure validation functions (no DB calls) for in-memory validation
     */

    /**
     * Validate cart value constraints
     */
    validateCartConstraints(coupon, cartTotal, items) {
        if (cartTotal && coupon.min_order_value > cartTotal) {
            return {
                isValid: false,
                message: `Minimum order value of ₹${coupon.min_order_value} required`,
                status: 400
            };
        }

        if (coupon.min_quantity && items.length < coupon.min_quantity) {
            return {
                isValid: false,
                message: `Minimum ${coupon.min_quantity} items required`,
                status: 400
            };
        }

        return { isValid: true };
    }

    /**
     * Validate product/category targeting
     */
    validateTargeting(coupon, items) {
        if (items.length > 0) {
            if (coupon.applies_to === 'products' && coupon.applicable_product_ids?.length > 0) {
                const productIds = items.map(item => item.product_id || item.productId);
                const hasMatch = productIds.some(id => coupon.applicable_product_ids.includes(id));
                if (!hasMatch) {
                    return { isValid: false, message: 'Coupon not valid for items in your cart', status: 400 };
                }
            }
            if (coupon.applies_to === 'categories' && coupon.applicable_category_ids?.length > 0) {
                const categoryIds = items.map(item => item.category_id || item.categoryId).filter(Boolean);
                if (categoryIds.length > 0) {
                    const hasMatch = categoryIds.some(id => coupon.applicable_category_ids.includes(id));
                    if (!hasMatch) {
                        return { isValid: false, message: 'Coupon not valid for categories in your cart', status: 400 };
                    }
                }
            }
        }
        return { isValid: true };
    }

    /**
     * Validate customer-specific constraints using pre-fetched data
     */
    validateCustomerConstraints(coupon, customerId, orderCount, usageCount) {
        if (!customerId) return { isValid: true };

        // Private Coupon
        if (coupon.is_private) {
            const allowedIds = coupon.allowed_customer_ids || [];
            if (!allowedIds.includes(customerId)) {
                return { isValid: false, message: 'Coupon not available for your account', status: 403 };
            }
        }

        // First Order Only
        if (coupon.is_first_order_only && orderCount > 0) {
            return { isValid: false, message: 'Only valid for first-time orders', status: 400 };
        }

        // Usage History (Single Use / Limit)
        if (coupon.is_single_use && usageCount > 0) {
            return { isValid: false, message: 'You have already used this coupon', status: 400 };
        }

        if (coupon.per_customer_limit && usageCount >= coupon.per_customer_limit) {
            return { isValid: false, message: `Limit of ${coupon.per_customer_limit} uses reached`, status: 400 };
        }

        return { isValid: true };
    }

    /**
     * Validate minimum product price requirement
     */
    validateMinProductPrice(coupon, items) {
        if (coupon.min_product_price > 0 && items.length > 0) {
            const hasQualifyingItem = items.some(item => {
                const price = parseFloat(item.unit_price || item.price || 0);
                return price >= coupon.min_product_price;
            });
            if (!hasQualifyingItem) {
                return {
                    isValid: false,
                    message: `Coupon requires at least one item priced ₹${coupon.min_product_price} or more`,
                    status: 400
                };
            }
        }
        return { isValid: true };
    }

    /**
     * Validate a coupon code against a specific context (cart/user)
     * @param {string} code - Coupon code
     * @param {Object} context - { customerId, cartTotal, items, user }
     * @returns {Object} { isValid, coupon, discountAmount, message, status }
     */
    async validateCoupon(code, context) {
        const { customerId, cartTotal, items = [] } = context;

        // 1. Fetch Coupon
        const coupon = await Coupon.findOne({
            where: {
                code,
                is_active: true,
                valid_from: { [Op.lte]: new Date() },
                valid_until: { [Op.gte]: new Date() }
            }
        });

        if (!coupon) {
            return { isValid: false, message: 'Invalid or expired coupon', status: 404 };
        }

        // 2. Global Usage Limit
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return { isValid: false, message: 'Coupon usage limit reached', status: 400 };
        }

        // 3. CartValue Constraints
        if (cartTotal && coupon.min_order_value > cartTotal) {
            return {
                isValid: false,
                message: `Minimum order value of ₹${coupon.min_order_value} required`,
                status: 400
            };
        }

        if (coupon.min_quantity && items.length < coupon.min_quantity) {
            return {
                isValid: false,
                message: `Minimum ${coupon.min_quantity} items required`,
                status: 400
            };
        }

        // 4. Targeting (Products/Categories)
        if (items.length > 0) {
            if (coupon.applies_to === 'products' && coupon.applicable_product_ids?.length > 0) {
                const productIds = items.map(item => item.product_id || item.productId);
                const hasMatch = productIds.some(id => coupon.applicable_product_ids.includes(id));
                if (!hasMatch) {
                    return { isValid: false, message: 'Coupon not valid for items in your cart', status: 400 };
                }
            }
            if (coupon.applies_to === 'categories' && coupon.applicable_category_ids?.length > 0) {
                // Assuming items contain category_id, if not joined, this check might need DB lookup
                // For now, we assume if category targeting is on, items have category info or we skip strict check
                const categoryIds = items.map(item => item.category_id || item.categoryId).filter(Boolean);
                if (categoryIds.length > 0) {
                    const hasMatch = categoryIds.some(id => coupon.applicable_category_ids.includes(id));
                    if (!hasMatch) {
                        return { isValid: false, message: 'Coupon not valid for categories in your cart', status: 400 };
                    }
                }
            }
        }

        // 5. Customer Constraints (Requires Customer ID)
        if (customerId) {
            // Private Coupon
            if (coupon.is_private) {
                const allowedIds = coupon.allowed_customer_ids || [];
                if (!allowedIds.includes(customerId)) {
                    return { isValid: false, message: 'Coupon not available for your account', status: 403 };
                }
            }

            // First Order Only
            if (coupon.is_first_order_only) {
                const orderCount = await Order.count({ where: { customer_id: customerId } });
                if (orderCount > 0) {
                    return { isValid: false, message: 'Only valid for first-time orders', status: 400 };
                }
            }

            // Usage History (Single Use / Limit)
            if (coupon.is_single_use) {
                const usage = await CouponUsage.findOne({
                    where: { coupon_id: coupon.id, customer_id: customerId }
                });
                if (usage) {
                    return { isValid: false, message: 'You have already used this coupon', status: 400 };
                }
            } else if (coupon.per_customer_limit) {
                const usageCount = await CouponUsage.count({
                    where: { coupon_id: coupon.id, customer_id: customerId }
                });
                if (usageCount >= coupon.per_customer_limit) {
                    return { isValid: false, message: `Limit of ${coupon.per_customer_limit} uses reached`, status: 400 };
                }
            }
        }

        // 6. Min Product Price Validation
        if (coupon.min_product_price > 0 && items.length > 0) {
            const hasQualifyingItem = items.some(item => {
                const price = parseFloat(item.unit_price || item.price || 0);
                return price >= coupon.min_product_price;
            });
            if (!hasQualifyingItem) {
                return {
                    isValid: false,
                    message: `Coupon requires at least one item priced ₹${coupon.min_product_price} or more`,
                    status: 400
                };
            }
        }

        // 7. Calculate Discount (Preview)
        // Pass items to calculate correctly based on min_product_price
        const discountAmount = this.calculateDiscountAmount(coupon, cartTotal, items);

        return {
            isValid: true,
            coupon,
            discountAmount,
            freeShipping: coupon.discount_type === 'free_shipping',
            message: 'Coupon applied successfully'
        };
    }

    /**
     * Calculate exact discount amount based on total
     * @param {Object} coupon 
     * @param {number} total 
     * @returns {number}
     */
    calculateDiscountAmount(coupon, total, items = []) {
        if (!total || total <= 0) return 0;

        let discountableAmount = 0;
        const appliesTo = coupon.applies_to || 'all';
        const productIds = coupon.applicable_product_ids || [];
        const categoryIds = coupon.applicable_category_ids || [];
        const minProductPrice = parseFloat(coupon.min_product_price || 0);

        // Filter items eligible for discount
        if (items.length > 0) {
            discountableAmount = items.reduce((sum, item) => {
                const price = parseFloat(item.unit_price || item.price || 0);
                const quantity = parseInt(item.quantity || 1);
                const itemId = item.product_id || item.productId;
                const itemCatId = item.category_id || item.categoryId;

                // 1. Check Min Product Price
                if (minProductPrice > 0 && price < minProductPrice) return sum;

                // 2. Check Targeting
                let isEligible = false;
                if (appliesTo === 'all') {
                    isEligible = true;
                } else if (appliesTo === 'products') {
                    isEligible = productIds.includes(itemId);
                } else if (appliesTo === 'categories') {
                    // Start with simple check, might need recursive category check in future
                    isEligible = categoryIds.includes(itemCatId);
                }

                if (isEligible) {
                    return sum + (price * quantity);
                }
                return sum;
            }, 0);
        } else {
            // Fallback for when items aren't passed (e.g. legacy calls), though validation tries to pass them.
            // If explicit targeting is on but no items passed, we can't calculate correctly.
            // Default to total if 'all', else 0 to be safe? 
            // For safety, if applies_to != all and no items, assume 0.
            if (appliesTo === 'all') discountableAmount = total;
        }

        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (discountableAmount * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
                discount = parseFloat(coupon.max_discount_amount);
            }
        } else if (coupon.discount_type === 'fixed') {
            discount = parseFloat(coupon.discount_value);
        } else if (coupon.discount_type === 'free_shipping') {
            return 0; // Handled separately (shipping_amount set to 0)
        } else if (coupon.discount_type === 'bogo') {
            // Logic handling in progress - placeholder
            // potentially: calculate cheapest item in discountableAmount group and subtract it?
            // For now return 0 to prevent error
            return 0;
        }

        // Ensure discount doesn't exceed total order value (cannot have negative total)
        return Math.min(discount, total);
    }

    /**
     * Record usage after successful order
     */
    async recordUsage(couponId, customerId, orderId, transaction) {
        if (!couponId || !customerId) return;

        await CouponUsage.create({
            coupon_id: couponId,
            customer_id: customerId,
            order_id: orderId
        }, { transaction });

        await Coupon.increment('used_count', {
            where: { id: couponId },
            transaction
        });
    }

    /**
     * Validate multiple coupon codes for stacking (OPTIMIZED with bulk queries)
     * @param {string[]} codes - Array of coupon codes
     * @param {Object} context - { customerId, cartTotal, items }
     * @returns {Object} { isValid, coupons[], totalDiscount, freeShipping, messages[] }
     */
    async validateMultipleCoupons(codes, context) {
        const MAX_COUPONS = 3;
        const { customerId, cartTotal, items = [] } = context;

        if (!codes || codes.length === 0) {
            return { isValid: false, message: 'No coupon codes provided', coupons: [] };
        }

        if (codes.length > MAX_COUPONS) {
            return { isValid: false, message: `Maximum ${MAX_COUPONS} coupons allowed`, coupons: [] };
        }

        // Remove duplicates
        const uniqueCodes = [...new Set(codes)];

        // OPTIMIZATION: Bulk fetch all coupons in one query
        const coupons = await this.fetchCouponsByCodes(uniqueCodes);

        // Map codes to coupons for easy lookup
        const couponMap = new Map(coupons.map(c => [c.code, c]));

        // OPTIMIZATION: Fetch all customer usage data in parallel (if customer is logged in)
        let usageData = { usageMap: new Map(), orderCount: 0 };
        if (customerId && coupons.length > 0) {
            const couponIds = coupons.map(c => c.id);
            usageData = await this.fetchCustomerUsageData(couponIds, customerId);
        }

        const validatedCoupons = [];
        const messages = [];
        let totalDiscount = 0;
        let freeShipping = false;

        // Validate each coupon code using in-memory validation
        for (const code of uniqueCodes) {
            const coupon = couponMap.get(code);

            // 1. Check if coupon exists and is active
            if (!coupon) {
                messages.push(`${code}: Invalid or expired coupon`);
                continue;
            }

            // 2. Global Usage Limit
            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                messages.push(`${code}: Coupon usage limit reached`);
                continue;
            }

            // 3. Cart Constraints (pure function)
            const cartResult = this.validateCartConstraints(coupon, cartTotal, items);
            if (!cartResult.isValid) {
                messages.push(`${code}: ${cartResult.message}`);
                continue;
            }

            // 4. Targeting (pure function)
            const targetingResult = this.validateTargeting(coupon, items);
            if (!targetingResult.isValid) {
                messages.push(`${code}: ${targetingResult.message}`);
                continue;
            }

            // 5. Customer Constraints (using pre-fetched data)
            const usageCount = usageData.usageMap.get(coupon.id) || 0;
            const customerResult = this.validateCustomerConstraints(
                coupon,
                customerId,
                usageData.orderCount,
                usageCount
            );
            if (!customerResult.isValid) {
                messages.push(`${code}: ${customerResult.message}`);
                continue;
            }

            // 6. Min Product Price (pure function)
            const priceResult = this.validateMinProductPrice(coupon, items);
            if (!priceResult.isValid) {
                messages.push(`${code}: ${priceResult.message}`);
                continue;
            }

            // 7. Stacking Rules
            if (validatedCoupons.length > 0) {
                // Check if new coupon is stackable
                if (!coupon.is_stackable) {
                    messages.push(`${code}: Cannot be combined with other coupons`);
                    continue;
                }

                // Check if any existing coupon is non-stackable
                const hasNonStackable = validatedCoupons.some(c => !c.is_stackable);
                if (hasNonStackable) {
                    messages.push(`${code}: Cannot add more coupons - existing coupon is non-stackable`);
                    continue;
                }

                // Check percentage + fixed mixing (not allowed)
                const hasPercentage = validatedCoupons.some(c => c.discount_type === 'percentage');
                const hasFixed = validatedCoupons.some(c => c.discount_type === 'fixed');

                if (coupon.discount_type === 'percentage' && hasFixed) {
                    messages.push(`${code}: Cannot combine percentage with fixed discount`);
                    continue;
                }
                if (coupon.discount_type === 'fixed' && hasPercentage) {
                    messages.push(`${code}: Cannot combine fixed with percentage discount`);
                    continue;
                }
                // Only one fixed discount allowed
                if (coupon.discount_type === 'fixed' && hasFixed) {
                    messages.push(`${code}: Cannot stack multiple fixed discounts`);
                    continue;
                }
            }

            // Add to validated list
            validatedCoupons.push(coupon);

            // Accumulate discount
            if (coupon.discount_type === 'free_shipping') {
                freeShipping = true;
            } else {
                totalDiscount += this.calculateDiscountAmount(coupon, cartTotal, items);
            }
        }

        if (validatedCoupons.length === 0) {
            return {
                isValid: false,
                message: messages.join('; ') || 'No valid coupons',
                coupons: []
            };
        }

        // Cap discount at cart total (cannot be negative)
        totalDiscount = Math.min(totalDiscount, cartTotal);

        return {
            isValid: true,
            coupons: validatedCoupons,
            discountAmount: totalDiscount,
            freeShipping,
            messages,
            message: validatedCoupons.length === uniqueCodes.length
                ? 'All coupons applied successfully'
                : `${validatedCoupons.length} of ${uniqueCodes.length} coupons applied`
        };
    }

    /**
     * Record usage for multiple coupons after successful order
     */
    async recordMultipleUsage(couponIds, customerId, orderId, transaction) {
        if (!couponIds || couponIds.length === 0 || !customerId) return;

        for (const couponId of couponIds) {
            await this.recordUsage(couponId, customerId, orderId, transaction);
        }
    }
}

export default new CouponValidationService();
