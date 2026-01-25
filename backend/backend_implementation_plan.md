# Backend Implementation Plan

This document outlines required changes and validations needed in the backend to support the customer frontend application.

**Scope**: Authentication, Products, Cart, Wishlist, Orders, Banners, Settings, Payment

---

## 1. Authentication

### Current Status: ✅ Mostly Complete

**Endpoints Required:**
- ✅ `POST /auth/register` - Documented
- ✅ `POST /auth/login` - Documented
- ✅ `POST /auth/firebase-sync` - Documented
- ✅ `GET /auth/me` - Documented
- ✅ `PUT /auth/me` - Documented
- ✅ `POST /auth/forgot-password` - Documented
- ✅ `POST /auth/reset-password` - Documented
- ✅ `GET /auth/addresses` - Documented
- ✅ `POST /auth/addresses` - Documented
- ✅ `PUT /auth/addresses/:id` - Documented
- ✅ `DELETE /auth/addresses/:id` - Documented

**Frontend Uses:**
- ❌ `/auth/profile` - **Does not exist, frontend incorrectly uses this**

**Action Required:**

### File: `backend/routes/auth.js`

**Verify endpoint exists:**
```javascript
// Should have:
router.get('/me', authenticateToken, async (req, res) => {
    // Return user profile
});

// Should NOT have /profile endpoint (frontend bug)
```

**No backend changes needed** - frontend needs to fix `/auth/profile` → `/auth/me`

---

## 2. Products

### Current Status: ⚠️ Partially Complete

**Endpoints Required:**
- ✅ `GET /products` - Documented
- ✅ `GET /products/categories` - Documented
- ✅ `GET /products/sizes` - Documented
- ✅ `GET /products/:slug` - Documented
- ✅ `GET /products/:productId/reviews` - Documented
- ✅ `POST /products/:productId/reviews` - Documented
- ❓ `GET /products/search` - **Not documented, needs verification**
- ❓ `GET /products/id/:id` - **Not documented, needs verification**

**Action Required:**

### File: `backend/routes/products.js`

**1. Verify Product Search Endpoint Exists:**

```javascript
// Should have:
router.get('/search', async (req, res) => {
    const { q } = req.query;
    // Search products by name, description, etc.
});
```

**If missing, add:**
```javascript
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ message: 'Search query required' });
        }

        const offset = (page - 1) * limit;
        
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } },
                    { sku: { [Op.iLike]: `%${q}%` } }
                ],
                is_active: true
            },
            include: [
                { model: Category },
                { model: Brand },
                { model: ProductImage }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const total = await Product.count({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } }
                ],
                is_active: true
            }
        });

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Product search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**2. Verify Product by ID Endpoint:**

```javascript
// Should have (in addition to by-slug):
router.get('/id/:id', async (req, res) => {
    const { id } = req.params;
    // Return product by UUID
});
```

**If missing, add:**
```javascript
router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id, {
            include: [
                { model: Category },
                { model: Brand },
                { model: ProductImage },
                { model: ProductVariant, include: [Size, Color] },
                {
                    model: Review,
                    where: { is_approved: true },
                    required: false,
                    include: [{ model: Customer, attributes: ['first_name', 'last_name'] }]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**3. Update Product List to Support Category Filter:**

```javascript
// Verify this works:
router.get('/', async (req, res) => {
    const { category_slug, page = 1, limit = 10 } = req.query;
    
    let whereClause = { is_active: true };
    let include = [
        { model: Category },
        { model: Brand },
        { model: ProductImage }
    ];

    // Add category filter if provided
    if (category_slug) {
        include[0].where = { slug: category_slug };
        include[0].required = true;
    }

    // ... rest of implementation
});
```

---

## 3. Cart

### Current Status: ⚠️ Interface Mismatch

**Endpoints Required:**
- ✅ `GET /cart` - Documented
- ✅ `POST /cart/items` - Documented  
- ✅ `PUT /cart/items/:id` - Documented
- ✅ `DELETE /cart/items/:id` - Documented

**Frontend Sends:**
```json
{
    "product_id": "uuid",
    "quantity": 1,
    "size": "M",
    "variant_id": "uuid"
}
```

**Backend Expects (per docs):**
```json
{
    "variant_id": "uuid",
    "quantity": 2
}
```

**Action Required:**

### File: `backend/routes/cart.js`

**Update Add to Cart endpoint to accept both formats:**

```javascript
router.post('/items', authenticateToken, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { variant_id, product_id, quantity, size } = req.body;

        // Support both variant_id and product_id + size
        let variantId = variant_id;
        
        if (!variantId && product_id && size) {
            // Find variant by product_id and size
            const sizeRecord = await Size.findOne({ where: { name: size } });
            if (sizeRecord) {
                const variant = await ProductVariant.findOne({
                    where: {
                        product_id: product_id,
                        size_id: sizeRecord.id
                    }
                });
                variantId = variant?.id;
            }
        }

        if (!variantId) {
            return res.status(400).json({ 
                message: 'Either variant_id or (product_id + size) is required' 
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ where: { customer_id: customerId } });
        if (!cart) {
            cart = await Cart.create({ customer_id: customerId });
        }

        // Check if item already exists
        let cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                variant_id: variantId
            }
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity || 1;
            await cartItem.save();
        } else {
            // Create new item
            cartItem = await CartItem.create({
                cart_id: cart.id,
                variant_id: variantId,
                quantity: quantity || 1
            });
        }

        // Return updated item with product details
        const updatedItem = await CartItem.findByPk(cartItem.id, {
            include: [{
                model: ProductVariant,
                include: [Product, Size, Color]
            }]
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**Update Cart Item Update endpoint:**

```javascript
router.put('/items/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, size } = req.body;
        const customerId = req.user.id;

        // Find cart item and verify ownership
        const cartItem = await CartItem.findByPk(id, {
            include: [{
                model: Cart,
                where: { customer_id: customerId }
            }]
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Update quantity
        if (quantity !== undefined) {
            cartItem.quantity = quantity;
        }

        // Update size (find new variant if size changed)
        if (size) {
            const variant = await ProductVariant.findOne({
                where: { id: cartItem.variant_id }
            });
            
            const product = await Product.findByPk(variant.product_id);
            const sizeRecord = await Size.findOne({ where: { name: size } });
            
            if (sizeRecord) {
                const newVariant = await ProductVariant.findOne({
                    where: {
                        product_id: product.id,
                        size_id: sizeRecord.id
                    }
                });
                
                if (newVariant) {
                    cartItem.variant_id = newVariant.id;
                }
            }
        }

        await cartItem.save();

        // Return updated item with details
        const updatedItem = await CartItem.findByPk(id, {
            include: [{
                model: ProductVariant,
                include: [Product, Size, Color]
            }]
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**Verify Delete Cart Item:**
```javascript
// Should accept item ID, not product ID
router.delete('/items/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;  // This is cart_item.id, not product.id
    // ... implementation
});
```

**⚠️ Important:** Frontend passes `product.id` but backend expects `cart_item.id`. Need to coordinate this!

---

## 4. Wishlist

### Current Status: ✅ Complete

**Per backend_api_doc.md:**
- ✅ `GET /wishlist` - Fully implemented
- ✅ `POST /wishlist/items` - Fully implemented
- ✅ `DELETE /wishlist/items/:id` - Fully implemented
- ✅ `DELETE /wishlist/clear` - Fully implemented

**No backend changes needed** - all endpoints are implemented and tested.

**Note:** Ensure frontend uses `wishlist_item.id` for deletion, not `product.id`

---

## 5. Orders

### Current Status: ⚠️ Interface Mismatch

**Endpoints Required:**
- ✅ `GET /orders` - Documented
- ✅ `POST /orders` - Documented
- ✅ `GET /orders/:id` - Documented

**Frontend Sends (CheckoutPage.tsx):**
```json
{
    "shipping_address": {
        "name": "...",
        "address": "...",
        "city": "...",
        "zip": "...",
        "phone": "..."
    },
    "billing_address": { ... },
    "items": [
        {
            "product_id": "uuid",
            "quantity": 2,
            "size": "M",
            "price": 1499.00,
            "variant_id": null
        }
    ],
    "subtotal": 2998.00,
    "tax": 539.64,
    "discount": 299.80,
    "total_amount": 3237.84,
    "payment_method": "razorpay",
    "currency": "INR",
    "coupon_code": "SAVE10"
}
```

**Backend Expects (per docs):**
```json
{
    "shipping_address": { ... },
    "billing_address": { ... },
    "shipping_method_id": "uuid"
}
```

**Action Required:**

### File: `backend/routes/orders.js`

**Update Create Order endpoint:**

```javascript
router.post('/', authenticateToken, async (req, res) => {
    try {
        const customerId = req.user.id;
        const {
            shipping_address,
            billing_address,
            items,
            subtotal,
            tax,
            discount,
            total_amount,
            payment_method,
            currency,
            coupon_code,
            shipping_method_id
        } = req.body;

        // Option 1: Use provided items
        // Option 2: Fall back to cart if no items provided
        let orderItems = items;
        
        if (!orderItems || orderItems.length === 0) {
            // Get items from cart
            const cart = await Cart.findOne({
                where: { customer_id: customerId },
                include: [{
                    model: CartItem,
                    include: [{
                        model: ProductVariant,
                        include: [Product, Size]
                    }]
                }]
            });

            if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
                return res.status(400).json({ message: 'No items in cart or order' });
            }

            orderItems = cart.CartItems.map(item => ({
                product_id: item.ProductVariant.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.ProductVariant.Product.sale_price || item.ProductVariant.Product.base_price,
                size: item.ProductVariant.Size.name
            }));
        }

        // Calculate totals if not provided
        let calculatedSubtotal = subtotal;
        let calculatedTotal = total_amount;
        
        if (!calculatedSubtotal) {
            calculatedSubtotal = orderItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
        }

        if (!calculatedTotal) {
            calculatedTotal = calculatedSubtotal + (tax || 0) - (discount || 0);
        }

        // Validate coupon if provided
        let appliedCoupon = null;
        if (coupon_code) {
            const coupon = await Coupon.findOne({
                where: {
                    code: coupon_code,
                    is_active: true,
                    [Op.and]: [
                        { valid_from: { [Op.lte]: new Date() } },
                        { valid_until: { [Op.gte]: new Date() } }
                    ]
                }
            });

            if (coupon) {
                appliedCoupon = coupon;
            }
        }

        // Create order
        const order = await Order.create({
            customer_id: customerId,
            order_status: 'pending',
            payment_status: 'pending',
            total_amount: calculatedTotal,
            subtotal_amount: calculatedSubtotal,
            tax_amount: tax || 0,
            discount_amount: discount || 0,
            shipping_address: JSON.stringify(shipping_address),
            billing_address: JSON.stringify(billing_address),
            payment_method: payment_method || 'razorpay',
            currency_code: currency || 'INR',
            coupon_code: coupon_code || null,
            shipping_method_id: shipping_method_id || null
        });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                size: item.size
            });
        }

        // Clear cart after order creation
        await CartItem.destroy({
            where: {
                cart_id: { [Op.in]: [
                    Sequelize.literal(`(SELECT id FROM carts WHERE customer_id = '${customerId}')`)
                ]}
            }
        });

        // Return order with items
        const createdOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        res.status(201).json({ order: createdOrder });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**Verify Get Orders returns correct format:**

```javascript
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customerId = req.user.id;

        const orders = await Order.findAll({
            where: { customer_id: customerId },
            include: [{
                model: OrderItem,
                as: 'Items',  // Frontend expects 'Items'
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'featured_image']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        // Format to match frontend expectations
        const formattedOrders = orders.map(order => ({
            order_id: order.id,
            createdAt: order.created_at,
            total_amount: order.total_amount,
            order_status: order.order_status,
            Items: order.Items
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

---

## 6. Payment

### Current Status: ✅ Documented

**Endpoints Required:**
- ✅ `POST /payment/create-order` - Documented
- ✅ `POST /payment/verify` - Documented
- ✅ `POST /payment/webhook` - Documented
- ✅ `GET /payment/status/:transaction_id` - Documented

**Action Required:**

### File: `backend/routes/payment.js`

**Verify Create Razorpay Order endpoint:**

```javascript
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { order_id } = req.body;

        // Get order
        const order = await Order.findByPk(order_id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create Razorpay order
        const amount = Math.round(order.total_amount * 100); // Convert to paise
        const currency = order.currency_code || 'INR';

        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency,
            receipt: order.id,
            notes: {
                order_id: order.id,
                customer_id: order.customer_id
            }
        });

        // Save transaction record
        await PaymentTransaction.create({
            order_id: order.id,
            gateway: 'razorpay',
            gateway_order_id: razorpayOrder.id,
            amount: order.total_amount,
            currency: currency,
            status: 'pending'
        });

        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

**Verify Payment Verification endpoint:**

```javascript
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Verify signature
        const crypto = require('crypto');
        const text = razorpay_order_id + '|' + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ 
                status: 'failed',
                message: 'Invalid signature' 
            });
        }

        // Update transaction
        const transaction = await PaymentTransaction.findOne({
            where: { gateway_order_id: razorpay_order_id }
        });

        if (transaction) {
            transaction.gateway_payment_id = razorpay_payment_id;
            transaction.status = 'success';
            transaction.completed_at = new Date();
            await transaction.save();

            // Update order status
            const order = await Order.findByPk(transaction.order_id);
            if (order) {
                order.payment_status = 'paid';
                order.order_status = 'confirmed';
                await order.save();
            }
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ 
            status: 'failed',
            message: 'Server error' 
        });
    }
});
```

---

## 7. Coupons

### Current Status: ✅ Documented

**Endpoints Required:**
- ✅ `POST /coupons/validate` - Documented

**Frontend Sends:**
```json
{
    "code": "SAVE10",
    "cart_total": 1000
}
```

**Backend Expects:**
```json
{
    "code": "SUMMER20",
    "cartTotal": 1000
}
```

**Action Required:**

### File: `backend/routes/coupons.js`

**Update to accept both parameter names:**

```javascript
router.post('/validate', async (req, res) => {
    try {
        const { code, cart_total, cartTotal } = req.body;
        const total = cart_total || cartTotal;  // Accept both

        if (!code || !total) {
            return res.status(400).json({ message: 'Code and cart total required' });
        }

        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                is_active: true,
                [Op.and]: [
                    { valid_from: { [Op.lte]: new Date() } },
                    { valid_until: { [Op.gte]: new Date() } }
                ]
            }
        });

        if (!coupon) {
            return res.status(404).json({ 
                isValid: false,
                message: 'Invalid or expired coupon' 
            });
        }

        // Check minimum order value
        if (coupon.min_order_value && total < coupon.min_order_value) {
            return res.status(400).json({ 
                isValid: false,
                message: `Minimum order value is ${coupon.min_order_value}` 
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (total * coupon.value) / 100;
        } else {
            discount = coupon.value;
        }

        res.json({
            isValid: true,
            coupon: {
                code: coupon.code,
                discount_type: coupon.discount_type,
                value: coupon.value,
                discount_amount: discount
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

---

## 8. Banners

### Current Status: ✅ Documented

**Endpoints Required:**
- ✅ `GET /banners` - Documented

**No action required** - endpoint is documented and should work.

**Verify it supports query params:**
```javascript
router.get('/', async (req, res) => {
    const { active, page } = req.query;
    
    let whereClause = {};
    if (active === 'true') {
        whereClause.is_active = true;
        whereClause.start_date = { [Op.lte]: new Date() };
        whereClause.end_date = { [Op.gte]: new Date() };
    }
    
    // Optional page filter
    if (page) {
        whereClause.page = page;
    }
    
    // ... implementation
});
```

---

## 9. Settings

### Current Status: ✅ Documented

**Endpoints Required:**
- ✅ `GET /settings` - Documented

**No action required** - endpoint is documented.

**Verify response format matches frontend expectations:**
```javascript
router.get('/', async (req, res) => {
    const settings = await Setting.findAll();
    
    // Convert to object format
    const settingsObj = {};
    settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
    });
    
    // Ensure these keys exist:
    // - site_currency_code
    // - site_currency_symbol
    
    res.json(settingsObj);
});
```

---

## Database Schema Verification

### Required Tables:
- ✅ customers
- ✅ products
- ✅ product_variants
- ✅ product_images
- ✅ categories
- ✅ brands
- ✅ sizes
- ✅ colors
- ✅ carts
- ✅ cart_items
- ✅ wishlists (check schema)
- ✅ wishlist_items (check schema)
- ✅ orders
- ✅ order_items
- ✅ payment_transactions
- ✅ coupons
- ✅ banners
- ✅ settings
- ✅ reviews
- ✅ addresses

### Verify Wishlist Schema Matches Implementation

Check `backend/schema/ACTUAL_DB_SCHEMA.md`:
- Wishlist should have `customer_id`
- WishlistItem should have `wishlist_id` and `product_id`
- Both should have UUID primary keys

---

## Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Add `/products/search` endpoint if missing
- [ ] Add `/products/id/:id` endpoint if missing
- [ ] Update `/cart/items` POST to accept `product_id + size`
- [ ] Fix cart/wishlist item ID vs product ID handling
- [ ] Update `/orders` POST to accept full order data
- [ ] Update `/coupons/validate` to accept both parameter names

### Phase 2: Validation
- [ ] Test all authentication endpoints
- [ ] Test product search and filters
- [ ] Test cart operations
- [ ] Test wishlist operations
- [ ] Test order creation with items
- [ ] Test payment flow
- [ ] Test coupon validation
- [ ] Test banner retrieval
- [ ] Test settings retrieval

### Phase 3: Documentation
- [ ] Update `backend_api_doc.md` with any missing endpoints
- [ ] Document parameter name alternatives
- [ ] Document response formats
- [ ] Add examples for all endpoints

---

## Breaking Changes Summary

1. **Order Creation**: Now accepts `items` array in request
2. **Cart Items**: Now accepts `product_id + size` in addition to `variant_id`
3. **Coupon Validation**: Now accepts both `cart_total` and `cartTotal`

---

## Testing Strategy

1. **Unit Tests**: Test each endpoint with various inputs
2. **Integration Tests**: Test complete flows (add to cart → checkout → payment)
3. **API Contract Tests**: Verify request/response formats match documentation
4. **Database Tests**: Verify data integrity after operations

---

## Priority Levels

**🔴 Critical (Must Fix):**
- Product search endpoint
- Cart add item flexibility
- Order creation with items

**🟡 Important (Should Fix):**
- Coupon parameter names
- Cart/Wishlist item ID handling

**🟢 Nice to Have:**
- Additional validation
- Better error messages
- Performance optimizations
