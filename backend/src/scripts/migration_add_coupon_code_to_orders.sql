-- Migration: Add coupon_code column to orders table
-- This column stores coupon codes as JSON to support multiple coupons per order

-- Check if column exists before adding
SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'coupon_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' JSON NULL COMMENT ''Stores coupon codes as JSON array for multi-coupon support'' AFTER coupon_id')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
