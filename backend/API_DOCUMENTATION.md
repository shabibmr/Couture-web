# Couture Backend API Documentation

Base URL: `http://localhost:5000/api`

## Authentication (`/auth`)

### Register Customer
- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890" // Optional
  }
  ```
- **Response**: `201 Created` with `{ message: 'Registration successful', token, user }`

### Login Customer
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK` with `{ token, user }`

### Login Admin
- **Endpoint**: `POST /auth/admin/login`
- **Body**:
  ```json
  {
    "email": "admin@couture.com",
    "password": "adminpassword"
  }
  ```
- **Response**: `200 OK` with `{ token, admin }`

### Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `200 OK` with success message (regardless of email existence for security).

### Reset Password
- **Endpoint**: `POST /auth/reset-password`
- **Body**: `{ "token": "...", "newPassword": "..." }`
- **Response**: `200 OK` or `400 Bad Request` if token invalid/expired.

### Get Current User Profile
- **Endpoint**: `GET /auth/me` (Auth Required)
- **Response**: `200 OK` with customer profile data (excluding password hash).

### Update Current User Profile
- **Endpoint**: `PUT /auth/me` (Auth Required)
- **Body**: `{ "first_name", "last_name", "phone" }` (all optional)
- **Response**: `200 OK` with updated user data.

### Sync Firebase User
- **Endpoint**: `POST /auth/firebase-sync`
- **Body**: `{ "idToken": "firebase-id-token" }`
- **Response**: `200 OK` with `{ user, token }` (creates or updates user from Firebase token).

### Customer Addresses
- **Get Addresses**: `GET /auth/addresses` (Auth Required)
- **Create Address**: `POST /auth/addresses` (Auth Required)
  - **Body**: `{ "full_name", "phone", "address_line1", "city", "state", "postal_code", "country" ... }`
- **Update Address**: `PUT /auth/addresses/:id` (Auth Required)
- **Delete Address**: `DELETE /auth/addresses/:id` (Auth Required)

---

## Products (`/products`)

### Get All Products
- **Endpoint**: `GET /products`
- **Query Params**: 
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search query for name/description
  - `category_slug`: Filter by category
  - `brand_slug`: Filter by brand
- **Response**: `200 OK` - List of products.

### Get Categories
- **Endpoint**: `GET /products/categories`
- **Response**: `200 OK` - List of all active categories.

### Create Category
- **Endpoint**: `POST /products/categories` (Auth Required)
- **Body**: `{ "name": "Category Name", "slug": "category-slug", "description": "...", "image_url": "..." }`
- **Response**: `201 Created` with category object.

### Update Category
- **Endpoint**: `PUT /products/categories/:id` (Auth Required)
- **Body**: Category fields to update.
- **Response**: `200 OK`.

### Delete Category
- **Endpoint**: `DELETE /products/categories/:id` (Auth Required)
- **Response**: `200 OK`.

### Get Sizes
- **Endpoint**: `GET /products/sizes`
- **Response**: `200 OK` - List of configured sizes.

### Get Product Reviews
- **Endpoint**: `GET /products/:productId/reviews`
- **Response**: `200 OK` - List of approved reviews with customer names.

### Create Product Review
- **Endpoint**: `POST /products/:productId/reviews` (Auth Required)
- **Body**:
  ```json
  {
    "rating": 5,
    "title": "Great Product",
    "comment": "Really loved it!"
  }
  ```
- **Response**: `201 Created` with review object.

### Get Product Details
- **Endpoint**: `GET /products/:slug`
- **Response**: `200 OK` - Single product details including variants and images.

### Create Product
- **Endpoint**: `POST /products`
- **Body**: Product details (Name, Slug, Prices, etc.)
- **Response**: `201 Created` with created product.

### Update Product
- **Endpoint**: `PUT /products/:id`
- **Body**: Product details to update.
- **Response**: `200 OK`.

### Delete Product
- **Endpoint**: `DELETE /products/:id`
- **Response**: `200 OK`.

### Add Product Variant
- **Endpoint**: `POST /products/:id/variants` (Auth Required)
- **Body**: `{ "size_id": "...", "color_id": "...", "sku": "...", "price": 100, "stock_quantity": 50 }`
- **Response**: `201 Created` with variant object.

### Delete Product Variant
- **Endpoint**: `DELETE /products/:id/variants/:variantId` (Auth Required)
- **Response**: `200 OK`.

---

## Wishlist (`/wishlist`)
**Headers**: `Authorization: Bearer <token>`

### Get Wishlist
- **Endpoint**: `GET /wishlist`
- **Response**: `200 OK` - Wishlist object with `items` array populated with product details.

### Add Product to Wishlist
- **Endpoint**: `POST /wishlist/items`
- **Body**:
  ```json
  {
    "product_id": "uuid-of-product"
  }
  ```
- **Response**: `201 Created` with added item.

### Remove Item from Wishlist
- **Endpoint**: `DELETE /wishlist/items/:id` (WishlistItem ID)
- **Response**: `200 OK`

### Clear Wishlist
- **Endpoint**: `DELETE /wishlist/clear`
- **Response**: `200 OK`

---

## Shopping Cart (`/cart`)
**Headers**: `Authorization: Bearer <token>`

### Get Cart
- **Endpoint**: `GET /cart`
- **Response**: `200 OK` - Cart object with `items` array populated with product details.

### Add Item to Cart
- **Endpoint**: `POST /cart/items`
- **Body**:
  ```json
  {
    "variant_id": "uuid-of-variant",
    "quantity": 2
  }
  ```
- **Response**: `200 OK` with updated item.

### Update Item Quantity
- **Endpoint**: `PUT /cart/items/:id` (Item ID)
- **Body**: `{ "quantity": 5 }`
- **Response**: `200 OK`

### Remove Item
- **Endpoint**: `DELETE /cart/items/:id` (Item ID)
- **Response**: `200 OK`

---

## Orders (`/orders`)
**Headers**: `Authorization: Bearer <token>`

### Create Order
- **Endpoint**: `POST /orders`
- **Body**:
  ```json
  {
    "shipping_address": { ... },
    "billing_address": { ... },
    "shipping_method_id": "uuid" // Optional
  }
  ```
- **Response**: `201 Created` with Order object. Note: creates order from current cart.

### Get All Orders
- **Endpoint**: `GET /orders`
- **Response**: `200 OK` - List of user's orders.

### Get Order Details
- **Endpoint**: `GET /orders/:id`
- **Response**: `200 OK` - Single order with line items.

### Update Order Status
- **Endpoint**: `PUT /orders/:id/status` (Auth Required)
- **Body**: `{ "status": "shipped" }` (enum: pending, processing, shipped, delivered, cancelled)
- **Response**: `200 OK` with updated order.

### Delete Order
- **Endpoint**: `DELETE /orders/:id` (Auth Required)
- **Response**: `200 OK`.

---

## Payments (`/payment`)
**Headers**: `Authorization: Bearer <token>`

### Create Razorpay Order
- **Endpoint**: `POST /payment/create-order`
- **Body**: `{ "order_id": "uuid-of-order" }`
- **Response**: `200 OK` with `{ id: "razorpay_order_id", amount, currency, key_id }`.

### Verify Payment
- **Endpoint**: `POST /payment/verify`
- **Body**:
  ```json
  {
    "razorpay_order_id": "...",
    "razorpay_payment_id": "...",
    "razorpay_signature": "..."
  }
  ```
- **Response**: `200 OK` if valid. Updates Order status to `confirmed`.

### Razorpay Webhook
- **Endpoint**: `POST /payment/webhook`
- **Notes**: Validates `X-Razorpay-Signature`. Handles `payment.captured`, `payment.failed`, `refund.processed`.

### Initiate Refund
- **Endpoint**: `POST /payment/refund`
- **Body**:
  ```json
  {
    "transaction_id": "uuid-of-transaction",
    "amount": 100.00,
    "reason": "Defective product"
  }
  ```
- **Response**: `200 OK` with refund details.

### Get Payment Status
- **Endpoint**: `GET /payment/status/:transaction_id`
- **Response**: `200 OK` with `{ transaction_status, gateway_status, details }`.

### Get All Payments
- **Endpoint**: `GET /payment` (Auth Required)
- **Response**: `200 OK` - List of all payment records.

---

## Inventory (`/inventory`)
**Headers**: `Authorization: Bearer <token>` (Admin Only)

### Get Inventory
- **Endpoint**: `GET /inventory`
- **Response**: `200 OK` - List of inventory items with product details.

### Update Stock
- **Endpoint**: `PUT /inventory/update`
- **Body**:
  ```json
  {
    "variant_id": "uuid-of-variant",
    "quantity": 50,
    "low_stock_threshold": 10 // Optional
  }
  ```
- **Response**: `200 OK` with updated inventory record.

### Get Low Stock
- **Endpoint**: `GET /inventory/low-stock`
- **Response**: `200 OK` - List of items where quantity <= low_stock_threshold.

---

## Marketing - Coupons (`/coupons`)
**Headers**: `Authorization: Bearer <token>` (Admin Only for CRUD)

### Get Coupons
- **Endpoint**: `GET /coupons`
- **Query Params**: `?active=true` (Optional)
- **Response**: `200 OK` - List of coupons.

### Create Coupon
- **Endpoint**: `POST /coupons`
- **Body**:
  ```json
  {
    "code": "SUMMER20",
    "discount_type": "percentage", // or "fixed"
    "value": 20,
    "valid_from": "2023-01-01",
    "valid_until": "2023-12-31",
    "usage_limit": 100, // Optional
    "min_order_value": 500 // Optional
  }
  ```
- **Response**: `201 Created`

### Validate Coupon
- **Endpoint**: `POST /coupons/validate`
- **Body**: `{ "code": "SUMMER20", "cartTotal": 1000 }`
- **Response**: `200 OK` with `{ isValid: true, coupon }` or `4xx` error.

### Update Coupon
- **Endpoint**: `PUT /coupons/:id`
- **Response**: `200 OK`

### Delete Coupon
- **Endpoint**: `DELETE /coupons/:id`
- **Response**: `200 OK`

---

## Marketing - Banners (`/banners`)

### Get Banners
- **Endpoint**: `GET /banners`
- **Query Params**: `?active=true` (Optional)
- **Response**: `200 OK` - List of banners sorted by sort_order.

### Create Banner
- **Endpoint**: `POST /banners`
- **Body**:
  ```json
  {
    "title": "Summer Sale",
    "image_url": "https://example.com/banner.jpg",
    "link_url": "/collection/summer",
    "start_date": "2023-06-01",
    "end_date": "2023-08-31",
    "is_active": true,
    "sort_order": 1
  }
  ```
- **Response**: `201 Created`

### Update Banner
- **Endpoint**: `PUT /banners/:id`
- **Response**: `200 OK`

### Delete Banner
- **Endpoint**: `DELETE /banners/:id`
- **Response**: `200 OK`

---

## Dashboard (`/dashboard`)
**Headers**: `Authorization: Bearer <token>` (Admin Only)

### Get Stats
- **Endpoint**: `GET /dashboard/stats`
- **Response**: `200 OK` - Dashboard statistics (sales files, user count, etc.).

---

## System Settings (`/settings`)

### Get Settings
- **Endpoint**: `GET /settings`
- **Response**: `200 OK` - System configuration settings.

### Update Settings
- **Endpoint**: `PUT /settings`
- **Headers**: `Authorization: Bearer <token>` (Admin Only)
- **Body**: JSON object with settings to update.
- **Response**: `200 OK`

---

## Notifications (`/notifications`)
**Headers**: `Authorization: Bearer <token>`

### Get Notifications
- **Endpoint**: `GET /notifications`
- **Response**: `200 OK` - List of user's notifications.

### Mark Notification as Read
- **Endpoint**: `PATCH /notifications/:id/read`
- **Response**: `200 OK` with updated notification.

### Delete Notification
- **Endpoint**: `DELETE /notifications/:id`
- **Response**: `200 OK`.
