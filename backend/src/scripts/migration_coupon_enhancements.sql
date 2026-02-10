-- Coupon Module Enhancements Migration (MySQL)
-- Run this script to add new coupon features

-- Add new columns to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_single_use BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_customer_limit INT NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_first_order_only BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10,2) NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_quantity INT DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applies_to VARCHAR(20) DEFAULT 'all';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_product_ids JSON NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_category_ids JSON NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS allowed_customer_ids JSON NULL;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_stackable BOOLEAN DEFAULT TRUE;

-- Update discount_type enum to include free_shipping
-- Note: MySQL requires recreating the column to add enum values
-- First check current values, then run if needed:
-- ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed', 'bogo', 'free_shipping') NOT NULL;

-- Create coupon_usages table for tracking per-customer usage
CREATE TABLE IF NOT EXISTS coupon_usages (
    id CHAR(36) PRIMARY KEY,
    coupon_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    order_id CHAR(36) NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create index for fast coupon usage lookups
CREATE INDEX idx_coupon_usage_lookup ON coupon_usages(coupon_id, customer_id);
