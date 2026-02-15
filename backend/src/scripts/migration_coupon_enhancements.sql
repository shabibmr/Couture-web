-- Coupon Module Enhancements Migration (MySQL)

-- 1. Add coupon_code to orders (Fixes "Error initiating payment")
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100) NULL AFTER coupon_id;

-- 2. Add missing columns to coupons (Fixes "Server error" on coupon validate)
-- Using individual ALTER statements for safety if some columns already exist

-- min_product_price
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_product_price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Minimum price of a single product to qualify';

-- is_single_use
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_single_use TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'One-time use per customer';

-- per_customer_limit
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_customer_limit INT NULL COMMENT 'Max uses per customer (null = unlimited)';

-- is_first_order_only
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_first_order_only TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Only valid for first-time customers';

-- max_discount_amount
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10,2) NULL COMMENT 'Cap for percentage discounts';

-- min_quantity
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_quantity INT NOT NULL DEFAULT 1 COMMENT 'Minimum cart items required';

-- applies_to
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applies_to ENUM('all','products','categories') NOT NULL DEFAULT 'all';

-- applicable_product_ids
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_product_ids JSON NULL COMMENT 'Array of targeted product IDs';

-- applicable_category_ids
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_category_ids JSON NULL COMMENT 'Array of targeted category IDs';

-- is_private
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_private TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Private code for specific users only';

-- allowed_customer_ids
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS allowed_customer_ids JSON NULL COMMENT 'Array of allowed customer IDs';

-- is_stackable
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_stackable TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Can be combined with other coupons';

-- 3. Modify discount_type enum to include free_shipping
-- Note: This might fail if the column is already correct, but in MySQL modifying an enum to add a value is generally safe if the current values are valid.
-- However, IF NOT EXISTS doesn't work for MODIFY COLUMN.
-- We will attempt it. If it fails, it might be because of strict mode or existing constraints, but strictly speaking this command updates the enum definition.
ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed', 'bogo', 'free_shipping') NOT NULL;


