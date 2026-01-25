# Expected Database Schema

This document details the database schema expected by the backend code, based on the analysis of Sequelize models defined in `backend/src/modules`.

## Identity Module

### `admins`
- `id`: UUID (PK)
- `email`: STRING (Unique, Not Null)
- `password_hash`: STRING (Not Null)
- `name`: STRING (Not Null)
- `role`: ENUM('super_admin', 'admin', 'staff') (Default: 'admin')
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `audit_logs`
- `id`: UUID (PK)
- `admin_id`: UUID (FK -> admins.id)
- `action`: STRING (Not Null)
- `entity_type`: STRING (Not Null)
- `entity_id`: UUID (Not Null)
- `old_values`: JSON
- `new_values`: JSON
- `ip_address`: STRING
- `created_at`: DATETIME

### `customers`
- `id`: UUID (PK)
- `email`: STRING (Unique, Not Null)
- `password_hash`: STRING
- `first_name`: STRING (Not Null)
- `last_name`: STRING (Not Null)
- `phone`: STRING
- `avatar_url`: TEXT
- `email_verified`: BOOLEAN (Default: false)
- `oauth_provider`: STRING
- `oauth_provider_id`: STRING
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `customer_addresses`
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> customers.id)
- `address_type`: STRING ('shipping', 'billing', 'both')
- `full_name`: STRING (Not Null)
- `phone`: STRING (Not Null)
- `address_line1`: STRING (Not Null)
- `address_line2`: STRING
- `city`: STRING (Not Null)
- `state`: STRING (Not Null)
- `postal_code`: STRING (Not Null)
- `country`: STRING (Default: 'India')
- `is_default_shipping`: BOOLEAN (Default: false)
- `is_default_billing`: BOOLEAN (Default: false)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `password_reset_tokens`
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> customers.id)
- `token`: STRING (Not Null)
- `expires_at`: DATE (Not Null)
- `used`: BOOLEAN (Default: false)
- `created_at`: DATETIME

### `wishlists`
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> customers.id)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `wishlist_items`
- `id`: UUID (PK)
- `wishlist_id`: UUID (FK -> wishlists.id)
- `product_id`: UUID (FK -> products.id)
- `added_at`: DATETIME (created_at)

## Catalog Module

### `brands`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `slug`: STRING (Unique, Not Null)
- `description`: TEXT
- `logo_url`: TEXT
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `categories`
- `id`: UUID (PK)
- `parent_id`: UUID (FK -> categories.id)
- `name`: STRING (Not Null)
- `slug`: STRING (Unique, Not Null)
- `description`: TEXT
- `image_url`: TEXT
- `sort_order`: INTEGER (Default: 0)
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `colors`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `hex_code`: STRING (Not Null)
- `rgb_code`: STRING

### `sizes`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `code`: STRING (Not Null)
- `size_group`: STRING
- `sort_order`: INTEGER (Default: 0)

### `products`
- `id`: UUID (PK)
- `category_id`: UUID (FK -> categories.id)
- `brand_id`: UUID (FK -> brands.id)
- `name`: STRING (Not Null)
- `slug`: STRING (Unique, Not Null)
- `description`: TEXT
- `base_price`: DECIMAL(10, 2) (Not Null)
- `sale_price`: DECIMAL(10, 2)
- `featured_image`: TEXT(long)
- `is_active`: BOOLEAN (Default: true)
- `is_featured`: BOOLEAN (Default: false)
- `is_new_arrival`: BOOLEAN (Default: false)
- `view_count`: INTEGER (Default: 0)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `product_images`
- `id`: UUID (PK)
- `product_id`: UUID (FK -> products.id)
- `image_url`: TEXT(long) (Not Null)
- `sort_order`: INTEGER (Default: 0)
- `created_at`: DATETIME

### `product_variants`
- `id`: UUID (PK)
- `product_id`: UUID (FK -> products.id)
- `sku`: STRING (Unique, Not Null)
- `size_id`: UUID (FK -> sizes.id)
- `color_id`: UUID (FK -> colors.id)
- `variant_price`: DECIMAL(10, 2)
- `variant_image`: TEXT
- `is_active`: BOOLEAN (Default: true)
- Indexes: Unique(product_id, size_id, color_id)

### `reviews`
- `id`: UUID (PK)
- `product_id`: UUID (FK -> products.id)
- `customer_id`: UUID (FK -> customers.id)
- `rating`: INTEGER (1-5)
- `title`: STRING
- `comment`: TEXT
- `status`: ENUM('pending', 'approved', 'rejected') (Default: 'approved')
- `created_at`: DATETIME
- `updated_at`: DATETIME

## Order Module

### `carts`
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> customers.id, Unique)
- `expires_at`: DATE
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `cart_items`
- `id`: UUID (PK)
- `cart_id`: UUID (FK -> carts.id)
- `variant_id`: UUID (FK -> product_variants.id)
- `quantity`: INTEGER (Default: 1)
- `added_at`: DATE (Default: NOW)
- Indexes: Unique(cart_id, variant_id)

### `orders`
- `id`: UUID (PK)
- `order_number`: STRING (Unique, Not Null)
- `customer_id`: UUID (FK -> customers.id)
- `status`: ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded') (Default: 'pending')
- `subtotal`: DECIMAL(10, 2) (Not Null)
- `tax_amount`: DECIMAL(10, 2) (Default: 0)
- `shipping_amount`: DECIMAL(10, 2) (Default: 0)
- `discount_amount`: DECIMAL(10, 2) (Default: 0)
- `total_amount`: DECIMAL(10, 2) (Not Null)
- `coupon_id`: UUID (FK -> coupons.id)
- `shipping_method_id`: UUID (FK -> shipping_methods.id)
- `shipping_address`: JSON (Not Null)
- `billing_address`: JSON (Not Null)
- `customer_notes`: TEXT
- `order_date`: DATE (Default: NOW)

### `order_items`
- `id`: UUID (PK)
- `order_id`: UUID (FK -> orders.id)
- `variant_id`: UUID (FK -> product_variants.id)
- `product_name`: STRING (Not Null)
- `variant_sku`: STRING (Not Null)
- `quantity`: INTEGER (Not Null)
- `unit_price`: DECIMAL(10, 2) (Not Null)
- `total_price`: DECIMAL(10, 2) (Not Null)
- `created_at`: DATETIME

### `shipping_methods`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `code`: STRING (Unique, Not Null)
- `base_rate`: DECIMAL(10, 2) (Not Null)
- `rate_type`: ENUM('flat', 'weight_based', 'price_based') (Default: 'flat')
- `min_delivery_days`: INTEGER
- `max_delivery_days`: INTEGER
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `shipments`
- `id`: UUID (PK)
- `order_id`: UUID (FK -> orders.id)
- `tracking_number`: STRING
- `carrier_name`: STRING
- `status`: ENUM('preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed') (Default: 'preparing')
- `shipped_date`: DATE
- `estimated_delivery`: DATE
- `delivered_date`: DATE
- `created_at`: DATETIME
- `updated_at`: DATETIME

## Payment Module

### `payment_gateways`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `code`: STRING (Unique, Not Null)
- `credentials`: JSON
- `is_active`: BOOLEAN (Default: true)

### `payment_transactions`
- `id`: UUID (PK)
- `order_id`: UUID (FK -> orders.id)
- `transaction_id`: STRING (Unique, Not Null)
- `payment_gateway_id`: UUID (FK -> payment_gateways.id)
- `amount`: DECIMAL(10, 2) (Not Null)
- `status`: ENUM('pending', 'completed', 'failed', 'refunded') (Default: 'pending')
- `gateway_response`: JSON
- `payment_date`: DATE

### `refunds`
- `id`: UUID (PK)
- `order_id`: UUID (FK -> orders.id)
- `transaction_id`: UUID (FK -> payment_transactions.id)
- `refund_amount`: DECIMAL(10, 2) (Not Null)
- `status`: ENUM('requested', 'approved', 'processing', 'completed', 'rejected') (Default: 'requested')
- `reason`: TEXT
- `admin_notes`: TEXT
- `requested_date`: DATE (Default: NOW)
- `processed_date`: DATE

## Inventory Module

### `inventory`
- `id`: UUID (PK)
- `variant_id`: UUID (FK -> product_variants.id, Unique)
- `quantity`: INTEGER (Default: 0)
- `reserved_quantity`: INTEGER (Default: 0)
- `low_stock_threshold`: INTEGER (Default: 0)
- `last_updated`: DATETIME (Default: NOW)
- Indexes: (variant_id)

### `newsletters`
- `id`: UUID (PK)
- `email`: STRING (Unique, Not Null)
- `is_subscribed`: BOOLEAN (Default: true)
- `subscribed_at`: DATETIME
- `unsubscribed_at`: DATETIME

## Marketing Module

### `banners`
- `id`: UUID (PK)
- `title`: STRING (Not Null)
- `description`: TEXT
- `image_url`: STRING (Not Null)
- `link_url`: STRING
- `sort_order`: INTEGER (Default: 0)
- `is_active`: BOOLEAN (Default: true)
- `start_date`: DATE
- `end_date`: DATE
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `coupons`
- `id`: UUID (PK)
- `code`: STRING (Unique, Not Null)
- `discount_type`: ENUM('percentage', 'fixed', 'bogo') (Not Null)
- `discount_value`: DECIMAL(10, 2) (Not Null)
- `min_order_value`: DECIMAL(10, 2) (Default: 0)
- `usage_limit`: INTEGER
- `used_count`: INTEGER (Default: 0)
- `valid_from`: DATE
- `valid_until`: DATE
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME

## Notification Module

### `notifications`
- `id`: UUID (PK)
- `user_id`: UUID (FK -> customers.id)
- `type`: ENUM('payment_success', 'payment_failed', 'refund_processed', 'order_shipped', 'order_delivered') (Not Null)
- `title`: STRING (Not Null)
- `message`: TEXT (Not Null)
- `read`: BOOLEAN (Default: false)
- `metadata`: JSON
- `created_at`: DATETIME
- `updated_at`: DATETIME

## System Module

### `seo_metadata`
- `id`: UUID (PK)
- `entity_type`: STRING (Not Null)
- `entity_id`: UUID (Not Null)
- `meta_title`: STRING
- `meta_description`: TEXT
- `meta_keywords`: TEXT
- `og_title`: STRING
- `og_description`: TEXT
- `og_image`: TEXT
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `settings`
- `id`: UUID (PK)
- `key`: STRING (Unique, Not Null)
- `value`: TEXT
- `description`: STRING
- `created_at`: DATETIME
- `updated_at`: DATETIME

### `taxes`
- `id`: UUID (PK)
- `name`: STRING (Not Null)
- `region`: STRING
- `rate`: DECIMAL(5, 2) (Not Null)
- `is_active`: BOOLEAN (Default: true)
- `created_at`: DATETIME
- `updated_at`: DATETIME
