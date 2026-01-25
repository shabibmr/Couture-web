# Actual Database Schema

Generated from database: couture_db

### `admins`
- `id`: char(36) (PK, Not Null)
- `email`: varchar(255) (Unique, Not Null)
- `password_hash`: varchar(255) (Not Null)
- `name`: varchar(255) (Not Null)
- `role`: enum('super_admin','admin','staff') (Index, Not Null, Default: 'admin')
- `is_active`: tinyint(1) (Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `audit_logs`
- `id`: char(36) (PK, Not Null)
- `admin_id`: char(36) (Index, Default: NULL)
- `action`: varchar(100) (Not Null)
- `entity_type`: varchar(50) (Not Null)
- `entity_id`: char(36) (Not Null)
- `old_values`: longtext (Default: NULL)
- `new_values`: longtext (Default: NULL)
- `ip_address`: varchar(45) (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `banners`
- `id`: char(36) (PK, Not Null)
- `title`: varchar(255) (Not Null)
- `description`: text (Default: NULL)
- `image_url`: text (Not Null)
- `link_url`: text (Default: NULL)
- `sort_order`: int(11) (Default: 0)
- `is_active`: tinyint(1) (Default: 1)
- `start_date`: timestamp (Default: NULL)
- `end_date`: timestamp (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `brands`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(255) (Not Null)
- `slug`: varchar(255) (Unique, Not Null)
- `description`: text (Default: NULL)
- `logo_url`: text (Default: NULL)
- `is_active`: tinyint(1) (Index, Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `carts`
- `id`: char(36) (PK, Not Null)
- `customer_id`: char(36) (Unique, Not Null)
- `expires_at`: timestamp (Index, Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `cart_items`
- `id`: char(36) (PK, Not Null)
- `cart_id`: char(36) (Index, Not Null)
- `variant_id`: char(36) (Index, Not Null)
- `quantity`: int(11) (Not Null, Default: 1)
- `added_at`: timestamp (Not Null, Default: current_timestamp())

### `categories`
- `id`: char(36) (PK, Not Null)
- `parent_id`: char(36) (Index, Default: NULL)
- `name`: varchar(255) (Not Null)
- `slug`: varchar(255) (Unique, Not Null)
- `description`: text (Default: NULL)
- `image_url`: text (Default: NULL)
- `sort_order`: int(11) (Index, Default: 0)
- `is_active`: tinyint(1) (Index, Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `colors`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(50) (Index, Not Null)
- `hex_code`: varchar(7) (Not Null)
- `rgb_code`: varchar(20) (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `coupons`
- `id`: char(36) (PK, Not Null)
- `code`: varchar(50) (Unique, Not Null)
- `discount_type`: enum('percentage','fixed','bogo') (Not Null)
- `discount_value`: decimal(10,2) (Not Null)
- `min_order_value`: decimal(10,2) (Default: 0.00)
- `usage_limit`: int(11) (Default: NULL)
- `used_count`: int(11) (Default: 0)
- `valid_from`: timestamp (Index, Default: NULL)
- `valid_until`: timestamp (Default: NULL)
- `is_active`: tinyint(1) (Index, Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `customers`
- `id`: char(36) (PK, Not Null)
- `email`: varchar(255) (Unique, Not Null)
- `password_hash`: varchar(255) (Default: NULL)
- `first_name`: varchar(100) (Not Null)
- `last_name`: varchar(100) (Not Null)
- `phone`: varchar(20) (Default: NULL)
- `avatar_url`: text (Default: NULL)
- `email_verified`: tinyint(1) (Default: 0)
- `oauth_provider`: varchar(50) (Index, Default: NULL)
- `oauth_provider_id`: varchar(255) (Default: NULL)
- `created_at`: timestamp (Index, Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `customer_addresses`
- `id`: char(36) (PK, Not Null)
- `customer_id`: char(36) (Index, Not Null)
- `address_type`: varchar(20) (Default: 'shipping')
- `full_name`: varchar(255) (Not Null)
- `phone`: varchar(20) (Not Null)
- `address_line1`: varchar(255) (Not Null)
- `address_line2`: varchar(255) (Default: NULL)
- `city`: varchar(100) (Not Null)
- `state`: varchar(100) (Not Null)
- `postal_code`: varchar(20) (Not Null)
- `country`: varchar(100) (Not Null, Default: 'India')
- `is_default_shipping`: tinyint(1) (Default: 0)
- `is_default_billing`: tinyint(1) (Default: 0)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `inventory`
- `id`: char(36) (PK, Not Null)
- `variant_id`: char(36) (Unique, Not Null)
- `quantity`: int(11) (Not Null, Default: 0)
- `reserved_quantity`: int(11) (Not Null, Default: 0)
- `low_stock_threshold`: int(11) (Default: 0)
- `last_updated`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `newsletters`
- `id`: char(36) (PK, Not Null)
- `email`: varchar(255) (Unique, Not Null)
- `is_subscribed`: tinyint(1) (Default: 1)
- `subscribed_at`: timestamp (Not Null, Default: current_timestamp())
- `unsubscribed_at`: timestamp (Default: NULL)

### `notifications`
- `id`: char(36) (PK, Not Null)
- `user_id`: char(36) (Index, Not Null)
- `type`: enum('payment_success','payment_failed','refund_processed','order_shipped','order_delivered') (Not Null)
- `title`: varchar(255) (Not Null)
- `message`: text (Not Null)
- `read`: tinyint(1) (Default: 0)
- `metadata`: longtext (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `orders`
- `id`: char(36) (PK, Not Null)
- `order_number`: varchar(50) (Unique, Not Null)
- `customer_id`: char(36) (Index, Not Null)
- `status`: enum('pending','processing','confirmed','shipped','delivered','cancelled','refunded') (Index, Not Null, Default: 'pending')
- `subtotal`: decimal(10,2) (Not Null)
- `tax_amount`: decimal(10,2) (Default: 0.00)
- `shipping_amount`: decimal(10,2) (Default: 0.00)
- `discount_amount`: decimal(10,2) (Default: 0.00)
- `total_amount`: decimal(10,2) (Not Null)
- `coupon_id`: char(36) (Index, Default: NULL)
- `shipping_method_id`: char(36) (Index, Default: NULL)
- `shipping_address`: longtext (Not Null)
- `billing_address`: longtext (Not Null)
- `customer_notes`: text (Default: NULL)
- `order_date`: timestamp (Index, Not Null, Default: current_timestamp())
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `order_items`
- `id`: char(36) (PK, Not Null)
- `order_id`: char(36) (Index, Not Null)
- `variant_id`: char(36) (Index, Not Null)
- `product_name`: varchar(255) (Not Null)
- `variant_sku`: varchar(100) (Not Null)
- `quantity`: int(11) (Not Null)
- `unit_price`: decimal(10,2) (Not Null)
- `total_price`: decimal(10,2) (Not Null)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `password_reset_tokens`
- `id`: char(36) (PK, Not Null)
- `customer_id`: char(36) (Index, Not Null)
- `token`: varchar(255) (Not Null)
- `expires_at`: datetime (Not Null)
- `used`: tinyint(1) (Default: 0)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `payment_gateways`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(255) (Not Null)
- `code`: varchar(50) (Unique, Not Null)
- `credentials`: longtext (Default: NULL)
- `is_active`: tinyint(1) (Index, Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `payment_transactions`
- `id`: char(36) (PK, Not Null)
- `order_id`: char(36) (Index, Not Null)
- `transaction_id`: varchar(255) (Unique, Not Null)
- `payment_gateway_id`: char(36) (Index, Not Null)
- `amount`: decimal(10,2) (Not Null)
- `status`: enum('pending','completed','failed','refunded') (Index, Not Null)
- `gateway_response`: longtext (Default: NULL)
- `payment_date`: timestamp (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `products`
- `id`: char(36) (PK, Not Null)
- `category_id`: char(36) (Index, Not Null)
- `brand_id`: char(36) (Index, Default: NULL)
- `name`: varchar(255) (Not Null)
- `slug`: varchar(255) (Unique, Not Null)
- `description`: text (Default: NULL)
- `base_price`: decimal(10,2) (Not Null)
- `sale_price`: decimal(10,2) (Default: NULL)
- `featured_image`: longtext (Default: NULL)
- `is_active`: tinyint(1) (Index, Default: 1)
- `is_featured`: tinyint(1) (Index, Default: 0)
- `is_new_arrival`: tinyint(1) (Index, Default: 0)
- `view_count`: int(11) (Default: 0)
- `created_at`: timestamp (Index, Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `product_images`
- `id`: char(36) (PK, Not Null)
- `product_id`: char(36) (Index, Not Null)
- `image_url`: longtext (Not Null)
- `sort_order`: int(11) (Default: 0)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `product_variants`
- `id`: char(36) (PK, Not Null)
- `product_id`: char(36) (Index, Not Null)
- `sku`: varchar(100) (Unique, Not Null)
- `size_id`: char(36) (Index, Default: NULL)
- `color_id`: char(36) (Index, Default: NULL)
- `variant_price`: decimal(10,2) (Default: NULL)
- `variant_image`: text (Default: NULL)
- `is_active`: tinyint(1) (Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `refunds`
- `id`: char(36) (PK, Not Null)
- `order_id`: char(36) (Index, Not Null)
- `transaction_id`: char(36) (Index, Default: NULL)
- `refund_amount`: decimal(10,2) (Not Null)
- `status`: varchar(50) (Default: 'requested')
- `reason`: text (Default: NULL)
- `admin_notes`: text (Default: NULL)
- `requested_date`: timestamp (Not Null, Default: current_timestamp())
- `processed_date`: timestamp (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `reviews`
- `id`: char(36) (PK, Not Null)
- `product_id`: char(36) (Index, Not Null)
- `customer_id`: char(36) (Index, Not Null)
- `rating`: int(11) (Not Null)
- `title`: varchar(255) (Default: NULL)
- `comment`: text (Default: NULL)
- `images`: longtext (Default: NULL)
- `status`: enum('pending','approved','rejected') (Index, Default: 'pending')
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `seo_metadata`
- `id`: char(36) (PK, Not Null)
- `entity_type`: varchar(50) (Index, Not Null)
- `entity_id`: char(36) (Not Null)
- `meta_title`: varchar(255) (Default: NULL)
- `meta_description`: text (Default: NULL)
- `meta_keywords`: text (Default: NULL)
- `og_title`: varchar(255) (Default: NULL)
- `og_description`: text (Default: NULL)
- `og_image`: text (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `settings`
- `id`: char(36) (PK, Not Null)
- `key`: varchar(255) (Unique, Not Null)
- `value`: text (Default: NULL)
- `description`: varchar(255) (Default: NULL)
- `createdAt`: timestamp (Not Null, Default: current_timestamp())
- `updatedAt`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `shipments`
- `id`: char(36) (PK, Not Null)
- `order_id`: char(36) (Index, Not Null)
- `tracking_number`: varchar(255) (Default: NULL)
- `carrier_name`: varchar(255) (Default: NULL)
- `status`: enum('preparing','shipped','in_transit','out_for_delivery','delivered','failed') (Index, Default: 'preparing')
- `shipped_date`: timestamp (Default: NULL)
- `estimated_delivery`: timestamp (Default: NULL)
- `delivered_date`: timestamp (Default: NULL)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `shipping_methods`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(255) (Not Null)
- `code`: varchar(50) (Unique, Not Null)
- `base_rate`: decimal(10,2) (Not Null)
- `rate_type`: varchar(20) (Default: 'flat')
- `min_delivery_days`: int(11) (Default: NULL)
- `max_delivery_days`: int(11) (Default: NULL)
- `is_active`: tinyint(1) (Index, Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `sizes`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(50) (Not Null)
- `code`: varchar(20) (Not Null)
- `size_group`: varchar(50) (Index, Default: NULL)
- `sort_order`: int(11) (Index, Default: 0)
- `created_at`: timestamp (Not Null, Default: current_timestamp())

### `taxes`
- `id`: char(36) (PK, Not Null)
- `name`: varchar(255) (Not Null)
- `region`: varchar(255) (Default: NULL)
- `rate`: decimal(5,2) (Not Null)
- `is_active`: tinyint(1) (Default: 1)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `wishlists`
- `id`: char(36) (PK, Not Null)
- `customer_id`: char(36) (Unique, Not Null)
- `created_at`: timestamp (Not Null, Default: current_timestamp())
- `updated_at`: timestamp (Not Null, Default: current_timestamp(), on update current_timestamp())

### `wishlist_items`
- `id`: char(36) (PK, Not Null)
- `wishlist_id`: char(36) (Index, Not Null)
- `product_id`: char(36) (Index, Not Null)
- `added_at`: timestamp (Not Null, Default: current_timestamp())

