-- Fix coupon_code column type to support multiple codes (JSON array)
ALTER TABLE orders MODIFY COLUMN coupon_code JSON NULL COMMENT 'Stores coupon codes as JSON array for multi-coupon support';
