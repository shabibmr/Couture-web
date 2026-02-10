-- Add min_product_price to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_product_price DECIMAL(10, 2) DEFAULT 0;
