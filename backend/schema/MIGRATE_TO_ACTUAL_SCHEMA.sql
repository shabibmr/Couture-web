
-- SQL Migration to align couture_db with ACTUAL_DB_SCHEMA.md
-- This script handles table renaming, missing tables, and data normalization for wishlists.

USE couture_db;

-- 1. Fix Settings table naming convention
-- Renaming updatedAt/createdAt to snake_case as per schema.
ALTER TABLE settings CHANGE COLUMN createdAt created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE settings CHANGE COLUMN updatedAt updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Create wishlist_items table
-- This table was missing from the database.
CREATE TABLE IF NOT EXISTS wishlist_items (
    id char(36) NOT NULL,
    wishlist_id char(36) NOT NULL,
    product_id char(36) NOT NULL,
    added_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY (wishlist_id),
    KEY (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Wishlist Data Normalization
-- The current wishlists table is flattened (one row per item).
-- We need to move items to wishlist_items and ensure one row per customer in wishlists.

-- Step A: Create a mapping of customers to a single 'master' wishlist ID.
CREATE TEMPORARY TABLE wishlist_mapping AS
SELECT MIN(id) as master_id, customer_id
FROM wishlists
GROUP BY customer_id;

-- Step B: Move the data to wishlist_items.
-- We use UUID() for the new primary keys of wishlist items.
-- If your MariaDB/MySQL version is older, ensure UUID() is available.
INSERT INTO wishlist_items (id, wishlist_id, product_id, added_at)
SELECT UUID(), m.master_id, w.product_id, w.added_at
FROM wishlists w
JOIN wishlist_mapping m ON w.customer_id = m.customer_id;

-- Step C: Clean up the wishlists table.
-- Delete rows that are not the 'master' row for a customer.
DELETE FROM wishlists WHERE id NOT IN (SELECT master_id FROM wishlist_mapping);

-- Step D: Alter wishlists structure to match the schema.
ALTER TABLE wishlists DROP COLUMN product_id;
ALTER TABLE wishlists DROP COLUMN added_at;
ALTER TABLE wishlists ADD COLUMN created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE wishlists ADD COLUMN updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Step E: Enforce unique customer_id constraint.
ALTER TABLE wishlists ADD UNIQUE INDEX idx_customer_id_unique (customer_id);

-- Cleanup
DROP TEMPORARY TABLE wishlist_mapping;
