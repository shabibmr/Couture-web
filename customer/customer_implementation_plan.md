# Customer Frontend Implementation Plan

This document outlines all required changes in the customer frontend application to align with backend API endpoints.

**Scope**: Authentication, Products, Cart, Wishlist, Orders, Banners, Settings, Payment

---

## 1. API Configuration Updates

### File: `customer/src/config/api.config.ts`

**Current Issues:**
- ❌ Incorrect endpoint: `/auth/profile` should be `/auth/me`
- ❌ Incorrect endpoint: `/marketing/coupons/validate` should be `/coupons/validate`
- ❌ Missing many endpoints
- ❌ Inconsistent structure (mix of strings and functions)

**Required Changes:**

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    // 1. AUTHENTICATION
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ADMIN_LOGIN: '/auth/admin/login',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        SYNC: '/auth/firebase-sync',
        ME: '/auth/me',  // ✅ FIXED: was '/auth/profile'
        UPDATE_ME: '/auth/me',
        ADDRESSES: '/auth/addresses',
        ADDRESS_BY_ID: (id: string) => `/auth/addresses/${id}`,
    },

    // 2. PRODUCTS
    PRODUCTS: {
        LIST: '/products',
        SEARCH: '/products/search',
        CATEGORIES: '/products/categories',
        SIZES: '/products/sizes',
        BY_SLUG: (slug: string) => `/products/${slug}`,
        BY_ID: (id: string) => `/products/id/${id}`,
        REVIEWS: (productId: string) => `/products/${productId}/reviews`,
        CREATE_REVIEW: (productId: string) => `/products/${productId}/reviews`,
    },

    // 3. CART
    CART: {
        GET: '/cart',
        ADD_ITEM: '/cart/items',
        UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
        REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    },

    // 4. WISHLIST
    WISHLIST: {
        GET: '/wishlist',
        ADD_ITEM: '/wishlist/items',
        REMOVE_ITEM: (itemId: string) => `/wishlist/items/${itemId}`,
        CLEAR: '/wishlist/clear',
    },

    // 5. ORDERS
    ORDERS: {
        LIST: '/orders',
        CREATE: '/orders',
        BY_ID: (orderId: string) => `/orders/${orderId}`,
    },

    // 6. PAYMENT
    PAYMENT: {
        CREATE_ORDER: '/payment/create-order',
        VERIFY: '/payment/verify',
        WEBHOOK: '/payment/webhook',
        STATUS: (transactionId: string) => `/payment/status/${transactionId}`,
        LIST: '/payment',
    },

    // 7. MARKETING
    COUPONS: {
        VALIDATE: '/coupons/validate',  // ✅ FIXED: was '/marketing/coupons/validate'
        LIST: '/coupons',
    },

    // 8. BANNERS
    BANNERS: '/banners',

    // 9. SETTINGS
    SETTINGS: '/settings',

    // DEPRECATED - for backward compatibility, remove after migration
    MARKETING: {
        BANNERS: '/banners',
        COUPONS: '/coupons/validate',
        NEWSLETTER: '/marketing/newsletter/subscribe'
    },
};
```

---

## 2. Authentication Changes

### File: `customer/src/context/AuthContext.tsx`

**Issues:**
- Uses hardcoded URL for Firebase sync
- Uses incorrect `/auth/profile` endpoint

**Changes Required:**

```typescript
// Line 158 - Fix Firebase sync endpoint usage
// BEFORE:
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SYNC}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
});

// AFTER (already correct, just verify)
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SYNC}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
});
```

**Note:** The AuthContext is already making the correct call. Just need to ensure API_ENDPOINTS.AUTH.ME is correct.

---

## 3. Products Changes

### File: `customer/src/pages/ProductDetail.tsx`

**Add Product Review Functionality**

```typescript
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';

// Add state for reviews
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
});

// Fetch reviews
useEffect(() => {
    const fetchReviews = async () => {
        if (product?.id) {
            try {
                const response = await api.get(API_ENDPOINTS.PRODUCTS.REVIEWS(product.id));
                setReviews(response.data);
            } catch (error) {
                logger.error('Error fetching reviews', { error });
            }
        }
    };
    fetchReviews();
}, [product?.id]);

// Submit review
const handleSubmitReview = async () => {
    if (!user) {
        alert('Please login to submit a review');
        return;
    }
    
    try {
        await api.post(API_ENDPOINTS.PRODUCTS.CREATE_REVIEW(product.id), newReview);
        alert('Review submitted successfully!');
        // Refresh reviews
        const response = await api.get(API_ENDPOINTS.PRODUCTS.REVIEWS(product.id));
        setReviews(response.data);
        setNewReview({ rating: 5, title: '', comment: '' });
    } catch (error) {
        logger.error('Error submitting review', { error });
        alert('Failed to submit review');
    }
};
```

### File: `customer/src/pages/ShopPage.tsx`

**Add Product Sizes Filter**

```typescript
// Add state for sizes
const [sizes, setSizes] = useState([]);

// Fetch sizes
useEffect(() => {
    const fetchSizes = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.PRODUCTS.SIZES);
            setSizes(response.data);
        } catch (error) {
            logger.error('Error fetching sizes', { error });
        }
    };
    fetchSizes();
}, []);
```

---

## 4. Cart Changes

### File: `customer/src/context/ShopContext.tsx`

**Fix Cart Item Operations**

**Lines 290-293 - Update Cart Item Quantity:**
```typescript
// BEFORE:
await api.put(`${API_ENDPOINTS.CART}/items/${item.id}`, {
    quantity: newQuantity,
    size: item.selectedSize || 'M'
});

// AFTER:
await api.put(API_ENDPOINTS.CART.UPDATE_ITEM(item.id), {
    quantity: newQuantity,
    size: item.selectedSize || 'M'
});
```

**Lines 309 - Remove Cart Item:**
```typescript
// BEFORE:
await api.delete(`${API_ENDPOINTS.CART}/items/${itemToRemove.id}`);

// AFTER:
await api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemToRemove.id));
```

**Lines 227 - Add to Cart:**
```typescript
// BEFORE:
await api.post(`${API_ENDPOINTS.CART}/items`, {
    product_id: product.id,
    quantity: 1,
    size: (product as any).selectedSize || 'M',
    variant_id: (product as any).variant_id
});

// AFTER:
await api.post(API_ENDPOINTS.CART.ADD_ITEM, {
    product_id: product.id,
    quantity: 1,
    size: (product as any).selectedSize || 'M',
    variant_id: (product as any).variant_id
});
```

**Lines 82 - Get Cart:**
```typescript
// BEFORE:
const cartRes = await api.get(API_ENDPOINTS.CART);

// AFTER:
const cartRes = await api.get(API_ENDPOINTS.CART.GET);
```

**Lines 103 - Sync Guest Cart:**
```typescript
// BEFORE:
await api.post(`${API_ENDPOINTS.CART}/items`, {
    product_id: guestItem.id,
    quantity: guestItem.quantity || 1,
    size: guestItem.selectedSize || 'M',
    variant_id: guestItem.variant_id
});

// AFTER:
await api.post(API_ENDPOINTS.CART.ADD_ITEM, {
    product_id: guestItem.id,
    quantity: guestItem.quantity || 1,
    size: guestItem.selectedSize || 'M',
    variant_id: guestItem.variant_id
});
```

---

## 5. Wishlist Changes

### File: `customer/src/context/ShopContext.tsx`

**Fix Wishlist Operations**

**Lines 136 - Get Wishlist:**
```typescript
// BEFORE:
const wishlistRes = await api.get(API_ENDPOINTS.WISHLIST);

// AFTER:
const wishlistRes = await api.get(API_ENDPOINTS.WISHLIST.GET);
```

**Lines 358 - Add to Wishlist:**
```typescript
// BEFORE:
await api.post(`${API_ENDPOINTS.WISHLIST}/items`, { product_id: product.id });

// AFTER:
await api.post(API_ENDPOINTS.WISHLIST.ADD_ITEM, { product_id: product.id });
```

**Lines 380 - Remove from Wishlist:**
```typescript
// BEFORE:
await api.delete(`${API_ENDPOINTS.WISHLIST}/items/${itemId}`);

// AFTER:
await api.delete(API_ENDPOINTS.WISHLIST.REMOVE_ITEM(itemId));
```

**Add Clear Wishlist Function:**
```typescript
const clearWishlist = async () => {
    if (user?.backendToken) {
        try {
            await api.delete(API_ENDPOINTS.WISHLIST.CLEAR);
            setWishlist([]);
            
            logRocketService.logStateChange({
                context: 'ShopContext',
                action: 'wishlist_cleared',
                previousValue: { wishlistCount: wishlist.length },
            });
        } catch (error) {
            logger.error('[Wishlist] Clear failed', { error });
        }
    }
};

// Add to context provider
return (
    <ShopContext.Provider value={{
        // ... existing values
        clearWishlist,
    }}>
        {children}
    </ShopContext.Provider>
);
```

---

## 6. Orders Changes

### File: `customer/src/context/ShopContext.tsx`

**Lines 153 - Get Orders:**
```typescript
// BEFORE:
const ordersRes = await api.get(API_ENDPOINTS.ORDERS);

// AFTER:
const ordersRes = await api.get(API_ENDPOINTS.ORDERS.LIST);
```

### File: `customer/src/pages/CheckoutPage.tsx`

**Lines 68 - Create Order:**
```typescript
// BEFORE:
const orderResponse = await api.post(API_ENDPOINTS.ORDERS, {
    // ... order data
});

// AFTER:
const orderResponse = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
    // ... order data
});
```

### New File: `customer/src/pages/OrderTrackingPage.tsx`

**Add Order Details Functionality:**

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api.config';
import api from '../services/api.service';

const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.ORDERS.BY_ID(orderId!));
                setOrder(response.data);
            } catch (error) {
                logger.error('Error fetching order', { error });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    // ... render order details
};
```

---

## 7. Payment Changes

### File: `customer/src/pages/CheckoutPage.tsx`

**Lines 78, 95 - Use API Config for Payment Endpoints:**

```typescript
// BEFORE:
const razorpayOrderResponse = await api.post('/payment/create-order', {
    order_id: backendOrderId
});

// AFTER:
const razorpayOrderResponse = await api.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    order_id: backendOrderId
});
```

```typescript
// BEFORE:
const verifyResponse = await api.post('/payment/verify', {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature
});

// AFTER:
const verifyResponse = await api.post(API_ENDPOINTS.PAYMENT.VERIFY, {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature
});
```

---

## 8. Coupons Changes

### File: `customer/src/pages/CartPage.tsx`

**Lines 70 - Fix Coupon Validation Endpoint:**

```typescript
// BEFORE:
const response = await api.post(API_ENDPOINTS.MARKETING.COUPONS, {
    code: couponCode,
    cart_total: subtotal
});

// AFTER:
const response = await api.post(API_ENDPOINTS.COUPONS.VALIDATE, {
    code: couponCode,
    cartTotal: subtotal  // Note: also fix parameter name to match backend
});
```

---

## 9. Banners Changes

### File: `customer/src/pages/HomePage.tsx`

**Lines 25 - Verify Banners Endpoint:**

```typescript
// Current (verify it's correct):
const response = await api.get(API_ENDPOINTS.BANNERS, {
    params: { page: 'home' }
});

// This is correct, no changes needed
```

---

## 10. Settings Changes

### File: `customer/src/context/ShopContext.tsx`

**Lines 47 - Verify Settings Endpoint:**

```typescript
// Current:
const res = await api.get(API_ENDPOINTS.SETTINGS || '/settings');

// Should be:
const res = await api.get(API_ENDPOINTS.SETTINGS);
```

---

## Implementation Checklist

### Phase 1: Critical Fixes (Immediate)
- [ ] Update `api.config.ts` with corrected endpoint structure
- [ ] Fix `/auth/profile` → `/auth/me` in api.config.ts
- [ ] Fix coupon endpoint in CartPage.tsx
- [ ] Fix payment endpoints in CheckoutPage.tsx
- [ ] Fix cart operations in ShopContext.tsx
- [ ] Fix wishlist operations in ShopContext.tsx
- [ ] Fix orders endpoint in ShopContext.tsx and CheckoutPage.tsx

### Phase 2: Feature Additions (High Priority)
- [ ] Add product reviews display in ProductDetail.tsx
- [ ] Add product review submission in ProductDetail.tsx
- [ ] Add product sizes filter in ShopPage.tsx
- [ ] Add clear wishlist functionality
- [ ] Add order details page (OrderTrackingPage.tsx)

### Phase 3: Testing & Validation
- [ ] Test authentication flow
- [ ] Test product browsing and reviews
- [ ] Test cart operations (add, update, remove)
- [ ] Test wishlist operations (add, remove, clear)
- [ ] Test checkout and payment flow
- [ ] Test order history and tracking
- [ ] Test coupon validation
- [ ] Test banner display

---

## Files to Modify

1. ✅ `customer/src/config/api.config.ts` - **Critical**
2. ✅ `customer/src/context/ShopContext.tsx` - **Critical**
3. ✅ `customer/src/pages/CheckoutPage.tsx` - **Critical**
4. ✅ `customer/src/pages/CartPage.tsx` - **Critical**
5. ⚠️ `customer/src/pages/ProductDetail.tsx` - Add reviews
6. ⚠️ `customer/src/pages/ShopPage.tsx` - Add sizes
7. ⚠️ `customer/src/pages/OrderTrackingPage.tsx` - Create new

---

## Breaking Changes Summary

- API endpoint structure changed from strings to objects for better organization
- Some hardcoded URLs must use API_ENDPOINTS config
- Coupon validation parameter changed from `cart_total` to `cartTotal`
- All endpoint usages must use the new structure (e.g., `API_ENDPOINTS.CART.GET` instead of `API_ENDPOINTS.CART`)

---

## Testing Strategy

1. **Unit Tests**: Test API endpoint construction
2. **Integration Tests**: Test API calls with mock responses
3. **E2E Tests**: Test complete user flows
4. **Manual Testing**: Verify all features work end-to-end

---

## Rollback Plan

If issues arise:
1. Keep old `api.config.ts` as `api.config.old.ts`
2. Add backward compatibility layer
3. Gradual migration with feature flags
