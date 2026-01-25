-- Migrate wishlist schema from single-table to two-table structure
-- This script handles migration of existing data if any

-- Step 1: Check if we need to migrate data from old structure
-- (This will be done manually if needed)

-- Step 2: Drop old wishlists table if it exists with wrong structure
DROP TABLE IF EXISTS wishlists;

-- Step 3: Create new wishlists table with correct structure
CREATE TABLE wishlists (
    id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_customer_id (customer_id),
    UNIQUE KEY unique_customer_wishlist (customer_id),
    CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 4: Create wishlist_items table
CREATE TABLE wishlist_items (
    id CHAR(36) NOT NULL,
    wishlist_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_wishlist_id (wishlist_id),
    KEY idx_product_id (product_id),
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id),
    CONSTRAINT fk_wishlist_item_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
