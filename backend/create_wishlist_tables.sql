-- Create wishlists and wishlist_items tables for Couture-web
-- This fixes the missing database schema issue

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id CHAR(36) NOT NULL PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    wishlist_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
    INDEX idx_wishlist_id (wishlist_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY unique_wishlist_product (wishlist_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
