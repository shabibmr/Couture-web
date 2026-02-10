-- Fix discount_type ENUM to include free_shipping
ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed', 'bogo', 'free_shipping') NOT NULL;
