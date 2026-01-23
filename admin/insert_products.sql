-- SQL Dump generated from plist1.csv (MySQL Compatible)
USE couture_db;

-- Ensure standard sizes exist
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'Small', 'S', 'clothing');
SET @size_s = (SELECT id FROM sizes WHERE code = 'S' LIMIT 1);
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'Medium', 'M', 'clothing');
SET @size_m = (SELECT id FROM sizes WHERE code = 'M' LIMIT 1);
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'Large', 'L', 'clothing');
SET @size_l = (SELECT id FROM sizes WHERE code = 'L' LIMIT 1);
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'Extra Large', 'XL', 'clothing');
SET @size_xl = (SELECT id FROM sizes WHERE code = 'XL' LIMIT 1);
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'XX Large', 'XXL', 'clothing');
SET @size_xxl = (SELECT id FROM sizes WHERE code = 'XXL' LIMIT 1);
INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), 'XXX Large', 'XXXL', 'clothing');
SET @size_xxxl = (SELECT id FROM sizes WHERE code = 'XXXL' LIMIT 1);

-- Categories
INSERT IGNORE INTO categories (id, name, slug, description, is_active) VALUES (UUID(), 'Co-ord Set', 'coord-set', 'Co-ord Set Products', true);
SET @cat_coord_set = (SELECT id FROM categories WHERE slug = 'coord-set' LIMIT 1);
INSERT IGNORE INTO categories (id, name, slug, description, is_active) VALUES (UUID(), 'Kurti Set', 'kurti-set', 'Kurti Set Products', true);
SET @cat_kurti_set = (SELECT id FROM categories WHERE slug = 'kurti-set' LIMIT 1);

-- Products, Variants and Inventory
-- Product: Red & Beige Floral Print Kurti Set
SET @prod_3627 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3627, @cat_kurti_set, 'Red & Beige Floral Print Kurti Set', 'red--beige-floral-print-kurti-set-3627', 'Pure Viscose Rayon', 1099, 1099, '2.jpeg', true);
  SET @3627_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3627_m_v, @prod_3627, '786-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3627_m_v, 3);
  SET @3627_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3627_l_v, @prod_3627, '786-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3627_l_v, 3);
  SET @3627_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3627_xl_v, @prod_3627, '786-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3627_xl_v, 3);
  SET @3627_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3627_xxl_v, @prod_3627, '786-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3627_xxl_v, 3);

-- Product: Orange & Pink Floral Print Kurti Set
SET @prod_3626 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3626, @cat_kurti_set, 'Orange & Pink Floral Print Kurti Set', 'orange--pink-floral-print-kurti-set-3626', 'Pure Viscose Rayon', 1099, 1099, '1.jpeg', true);
  SET @3626_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3626_m_v, @prod_3626, '787-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3626_m_v, 2);
  SET @3626_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3626_l_v, @prod_3626, '787-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3626_l_v, 2);
  SET @3626_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3626_xl_v, @prod_3626, '787-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3626_xl_v, 2);
  SET @3626_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3626_xxl_v, @prod_3626, '787-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3626_xxl_v, 2);

-- Product: Black & White Geometric Print Kurti Set
SET @prod_3624 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3624, @cat_kurti_set, 'Black & White Geometric Print Kurti Set', 'black--white-geometric-print-kurti-set-3624', 'Pure Viscose Rayon', 1099, 1099, '3.jpeg', true);
  SET @3624_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3624_m_v, @prod_3624, '788-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3624_m_v, 1);
  SET @3624_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3624_l_v, @prod_3624, '788-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3624_l_v, 1);
  SET @3624_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3624_xl_v, @prod_3624, '788-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3624_xl_v, 1);
  SET @3624_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3624_xxl_v, @prod_3624, '788-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3624_xxl_v, 1);

-- Product: Yellow & Red Geometric Print Kurti Set
SET @prod_3629 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3629, @cat_kurti_set, 'Yellow & Red Geometric Print Kurti Set', 'yellow--red-geometric-print-kurti-set-3629', 'Pure Viscose Rayon', 1099, 1099, '6.jpeg', true);
  SET @3629_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3629_m_v, @prod_3629, '789-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3629_m_v, 1);
  SET @3629_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3629_l_v, @prod_3629, '789-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3629_l_v, 1);
  SET @3629_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3629_xl_v, @prod_3629, '789-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3629_xl_v, 1);
  SET @3629_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3629_xxl_v, @prod_3629, '789-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3629_xxl_v, 1);

-- Product: Beige & Pink Floral Print Kurti Set
SET @prod_3628 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3628, @cat_kurti_set, 'Beige & Pink Floral Print Kurti Set', 'beige--pink-floral-print-kurti-set-3628', 'Cotton', 999, 999, '5.jpeg', true);
  SET @3628_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3628_m_v, @prod_3628, '790-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3628_m_v, 1);
  SET @3628_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3628_l_v, @prod_3628, '790-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3628_l_v, 1);
  SET @3628_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3628_xl_v, @prod_3628, '790-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3628_xl_v, 1);
  SET @3628_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3628_xxl_v, @prod_3628, '790-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3628_xxl_v, 1);

-- Product: White Embroidered Kurti Set with Dupatta
SET @prod_19 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_19, @cat_kurti_set, 'White Embroidered Kurti Set with Dupatta', 'white-embroidered-kurti-set-with-dupatta-19', 'Pure Cotton with Embro.Work + Lining', 1499, 1499, '4.jpeg', true);
  SET @19_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@19_m_v, @prod_19, '791-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @19_m_v, 1);
  SET @19_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@19_l_v, @prod_19, '791-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @19_l_v, 1);
  SET @19_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@19_xl_v, @prod_19, '791-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @19_xl_v, 1);
  SET @19_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@19_xxl_v, @prod_19, '791-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @19_xxl_v, 1);

-- Product: Blue & Yellow Striped Floral Print Kurti Set
SET @prod_3150 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3150, @cat_kurti_set, 'Blue & Yellow Striped Floral Print Kurti Set', 'blue--yellow-striped-floral-print-kurti-set-3150', 'Viscose Rayon', 1099, 1099, '8.jpeg', true);
  SET @3150_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3150_m_v, @prod_3150, '792-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3150_m_v, 1);
  SET @3150_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3150_l_v, @prod_3150, '792-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3150_l_v, 1);
  SET @3150_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3150_xl_v, @prod_3150, '792-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3150_xl_v, 1);
  SET @3150_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3150_xxl_v, @prod_3150, '792-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3150_xxl_v, 1);

-- Product: Light Green Pleated Kurti Set
SET @prod_1861 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_1861, @cat_kurti_set, 'Light Green Pleated Kurti Set', 'light-green-pleated-kurti-set-1861', 'Linen Flex Cotton', 1149, 1149, '39.jpeg', true);
  SET @1861_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1861_m_v, @prod_1861, '794-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1861_m_v, 1);
  SET @1861_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1861_l_v, @prod_1861, '794-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1861_l_v, 1);
  SET @1861_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1861_xl_v, @prod_1861, '794-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1861_xl_v, 1);
  SET @1861_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1861_xxl_v, @prod_1861, '794-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1861_xxl_v, 1);

-- Product: Brown Pleated Kurti Set
SET @prod_1862 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_1862, @cat_kurti_set, 'Brown Pleated Kurti Set', 'brown-pleated-kurti-set-1862', 'Linen Flex Cotton', 1149, 1149, '35.jpeg', true);
  SET @1862_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1862_m_v, @prod_1862, '795-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1862_m_v, 1);
  SET @1862_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1862_l_v, @prod_1862, '795-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1862_l_v, 1);
  SET @1862_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1862_xl_v, @prod_1862, '795-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1862_xl_v, 1);
  SET @1862_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1862_xxl_v, @prod_1862, '795-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1862_xxl_v, 1);

-- Product: White & Orange Ikat Print Kurti Set
SET @prod_3000 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3000, @cat_kurti_set, 'White & Orange Ikat Print Kurti Set', 'white--orange-ikat-print-kurti-set-3000', 'Pure Cambric 60x60 Cotton Digital Print', 999, 999, '12.jpeg', true);
  SET @3000_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3000_m_v, @prod_3000, '796-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3000_m_v, 1);
  SET @3000_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3000_l_v, @prod_3000, '796-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3000_l_v, 1);
  SET @3000_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3000_xl_v, @prod_3000, '796-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3000_xl_v, 1);
  SET @3000_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3000_xxl_v, @prod_3000, '796-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3000_xxl_v, 1);
  SET @3000_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3000_xxxl_v, @prod_3000, '796-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3000_xxxl_v, 1);

-- Product: Abstract Print Shirt Collar Kurti Set
SET @prod_3283 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3283, @cat_kurti_set, 'Abstract Print Shirt Collar Kurti Set', 'abstract-print-shirt-collar-kurti-set-3283', 'Slub Cotton', 999, 999, '10.jpeg', true);
  SET @3283_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3283_m_v, @prod_3283, '797-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3283_m_v, 1);
  SET @3283_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3283_l_v, @prod_3283, '797-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3283_l_v, 1);
  SET @3283_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3283_xl_v, @prod_3283, '797-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3283_xl_v, 1);
  SET @3283_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3283_xxl_v, @prod_3283, '797-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3283_xxl_v, 1);

-- Product: Black & Red Floral Print Kurti Set
SET @prod_2809 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2809, @cat_kurti_set, 'Black & Red Floral Print Kurti Set', 'black--red-floral-print-kurti-set-2809', 'Cotton Silk', 999, 999, '11.jpeg', true);
  SET @2809_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2809_l_v, @prod_2809, '798-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2809_l_v, 1);
  SET @2809_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2809_xl_v, @prod_2809, '798-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2809_xl_v, 1);
  SET @2809_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2809_xxl_v, @prod_2809, '798-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2809_xxl_v, 1);
  SET @2809_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2809_xxxl_v, @prod_2809, '798-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2809_xxxl_v, 1);

-- Product: Pink Floral Embroidered Co-ord Set
SET @prod_3551 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3551, @cat_coord_set, 'Pink Floral Embroidered Co-ord Set', 'pink-floral-embroidered-coord-set-3551', 'Pure Cotton with Embro.Work', 999, 999, '44.jpeg', true);
  SET @3551_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3551_m_v, @prod_3551, '799-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3551_m_v, 1);
  SET @3551_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3551_l_v, @prod_3551, '799-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3551_l_v, 1);
  SET @3551_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3551_xl_v, @prod_3551, '799-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3551_xl_v, 1);
  SET @3551_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3551_xxl_v, @prod_3551, '799-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3551_xxl_v, 1);

-- Product: Blue Floral Embroidered Co-ord Set
SET @prod_3553 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3553, @cat_coord_set, 'Blue Floral Embroidered Co-ord Set', 'blue-floral-embroidered-coord-set-3553', 'Pure Cotton with Embro.Work', 999, 999, '43.jpeg', true);
  SET @3553_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3553_m_v, @prod_3553, '800-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3553_m_v, 1);
  SET @3553_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3553_l_v, @prod_3553, '800-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3553_l_v, 1);
  SET @3553_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3553_xl_v, @prod_3553, '800-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3553_xl_v, 1);
  SET @3553_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3553_xxl_v, @prod_3553, '800-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3553_xxl_v, 1);

-- Product: Maroon & White Floral Print Kurti Set
SET @prod_3284 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3284, @cat_kurti_set, 'Maroon & White Floral Print Kurti Set', 'maroon--white-floral-print-kurti-set-3284', 'Mix Cotton', 999, 999, '14.jpeg', true);
  SET @3284_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3284_m_v, @prod_3284, '801-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3284_m_v, 1);
  SET @3284_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3284_l_v, @prod_3284, '801-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3284_l_v, 1);
  SET @3284_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3284_xl_v, @prod_3284, '801-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3284_xl_v, 1);
  SET @3284_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3284_xxl_v, @prod_3284, '801-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3284_xxl_v, 1);
  SET @3284_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3284_xxxl_v, @prod_3284, '801-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3284_xxxl_v, 1);

-- Product: Yellow & White Floral Print Co-ord Set
SET @prod_2411 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2411, @cat_coord_set, 'Yellow & White Floral Print Co-ord Set', 'yellow--white-floral-print-coord-set-2411', 'Poly Rayon', 649, 649, '48.jpeg', true);
  SET @2411_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2411_m_v, @prod_2411, '803-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2411_m_v, 1);
  SET @2411_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2411_l_v, @prod_2411, '803-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2411_l_v, 1);
  SET @2411_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2411_xl_v, @prod_2411, '803-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2411_xl_v, 1);
  SET @2411_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2411_xxl_v, @prod_2411, '803-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2411_xxl_v, 1);

-- Product: Pink Embroidered Kurti Set
SET @prod_1795 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_1795, @cat_kurti_set, 'Pink Embroidered Kurti Set', 'pink-embroidered-kurti-set-1795', 'Linen Flex Cotton with Embroidery Work', 1149, 1149, '13.jpeg', true);
  SET @1795_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1795_l_v, @prod_1795, '805-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1795_l_v, 1);
  SET @1795_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1795_xl_v, @prod_1795, '805-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1795_xl_v, 1);
  SET @1795_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1795_xxl_v, @prod_1795, '805-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1795_xxl_v, 1);
  SET @1795_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1795_xxxl_v, @prod_1795, '805-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1795_xxxl_v, 1);

-- Product: Maroon & White Floral Print Co-ord Set
SET @prod_2318 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2318, @cat_coord_set, 'Maroon & White Floral Print Co-ord Set', 'maroon--white-floral-print-coord-set-2318', 'Poly Cotton', 649, 649, '45.jpeg', true);
  SET @2318_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2318_m_v, @prod_2318, '806-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2318_m_v, 1);
  SET @2318_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2318_l_v, @prod_2318, '806-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2318_l_v, 1);
  SET @2318_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2318_xl_v, @prod_2318, '806-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2318_xl_v, 1);
  SET @2318_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2318_xxl_v, @prod_2318, '806-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2318_xxl_v, 1);

-- Product: Aqua Blue & Blue Leaf Print Co-ord Set
SET @prod_3169 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3169, @cat_coord_set, 'Aqua Blue & Blue Leaf Print Co-ord Set', 'aqua-blue--blue-leaf-print-coord-set-3169', 'Poly Rayon', 649, 649, '46.jpeg', true);
  SET @3169_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3169_m_v, @prod_3169, '807-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3169_m_v, 1);
  SET @3169_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3169_l_v, @prod_3169, '807-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3169_l_v, 1);
  SET @3169_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3169_xl_v, @prod_3169, '807-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3169_xl_v, 1);
  SET @3169_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3169_xxl_v, @prod_3169, '807-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3169_xxl_v, 1);

-- Product: Purple Parrot Embroidered Kurti Set
SET @prod_3135 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3135, @cat_kurti_set, 'Purple Parrot Embroidered Kurti Set', 'purple-parrot-embroidered-kurti-set-3135', 'Cotton Slub with Embroidery Work', 1499, 1499, '19.jpeg', true);
  SET @3135_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3135_l_v, @prod_3135, '808-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3135_l_v, 1);
  SET @3135_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3135_xl_v, @prod_3135, '808-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3135_xl_v, 1);
  SET @3135_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3135_xxl_v, @prod_3135, '808-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3135_xxl_v, 1);
  SET @3135_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3135_xxxl_v, @prod_3135, '808-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3135_xxxl_v, 1);

-- Product: Teal Blue Parrot Embroidered Kurti Set
SET @prod_3133 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3133, @cat_kurti_set, 'Teal Blue Parrot Embroidered Kurti Set', 'teal-blue-parrot-embroidered-kurti-set-3133', 'Cotton Slub with Embroidery Work', 1499, 1499, '15.jpeg', true);
  SET @3133_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3133_l_v, @prod_3133, '809-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3133_l_v, 1);
  SET @3133_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3133_xl_v, @prod_3133, '809-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3133_xl_v, 1);
  SET @3133_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3133_xxl_v, @prod_3133, '809-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3133_xxl_v, 1);
  SET @3133_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3133_xxxl_v, @prod_3133, '809-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3133_xxxl_v, 1);

-- Product: Yellow Parrot Embroidered Kurti Set
SET @prod_3132 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3132, @cat_kurti_set, 'Yellow Parrot Embroidered Kurti Set', 'yellow-parrot-embroidered-kurti-set-3132', 'Cotton Slub with Embroidery Work', 1499, 1499, '16.jpeg', true);
  SET @3132_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3132_l_v, @prod_3132, '810-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3132_l_v, 1);
  SET @3132_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3132_xl_v, @prod_3132, '810-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3132_xl_v, 1);
  SET @3132_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3132_xxl_v, @prod_3132, '810-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3132_xxl_v, 1);
  SET @3132_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3132_xxxl_v, @prod_3132, '810-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3132_xxxl_v, 1);

-- Product: Black & White Floral Embroidered Kurti Set
SET @prod_3556 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3556, @cat_kurti_set, 'Black & White Floral Embroidered Kurti Set', 'black--white-floral-embroidered-kurti-set-3556', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '23.jpeg', true);
  SET @3556_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3556_m_v, @prod_3556, '811-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3556_m_v, 1);
  SET @3556_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3556_l_v, @prod_3556, '811-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3556_l_v, 1);
  SET @3556_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3556_xl_v, @prod_3556, '811-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3556_xl_v, 1);
  SET @3556_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3556_xxl_v, @prod_3556, '811-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3556_xxl_v, 1);

-- Product: Olive Green Floral Embroidered Kurti Set
SET @prod_3555 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3555, @cat_kurti_set, 'Olive Green Floral Embroidered Kurti Set', 'olive-green-floral-embroidered-kurti-set-3555', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '25.jpeg', true);
  SET @3555_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3555_m_v, @prod_3555, '812-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3555_m_v, 1);
  SET @3555_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3555_l_v, @prod_3555, '812-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3555_l_v, 1);
  SET @3555_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3555_xl_v, @prod_3555, '812-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3555_xl_v, 1);
  SET @3555_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3555_xxl_v, @prod_3555, '812-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3555_xxl_v, 1);

-- Product: Teal Green Floral Embroidered Kurti Set
SET @prod_3554 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3554, @cat_kurti_set, 'Teal Green Floral Embroidered Kurti Set', 'teal-green-floral-embroidered-kurti-set-3554', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '24.jpeg', true);
  SET @3554_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3554_m_v, @prod_3554, '813-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3554_m_v, 1);
  SET @3554_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3554_l_v, @prod_3554, '813-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3554_l_v, 1);
  SET @3554_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3554_xl_v, @prod_3554, '813-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3554_xl_v, 1);
  SET @3554_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3554_xxl_v, @prod_3554, '813-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3554_xxl_v, 1);

-- Product: Off-White Floral Embroidered Co-ord Set
SET @prod_1900 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_1900, @cat_kurti_set, 'Off-White Floral Embroidered Co-ord Set', 'offwhite-floral-embroidered-coord-set-1900', 'Linen Flex Cotton', 1399, 1399, '27.jpeg', true);
  SET @1900_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1900_m_v, @prod_1900, '814-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1900_m_v, 1);
  SET @1900_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1900_l_v, @prod_1900, '814-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1900_l_v, 1);
  SET @1900_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1900_xl_v, @prod_1900, '814-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1900_xl_v, 1);
  SET @1900_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@1900_xxl_v, @prod_1900, '814-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @1900_xxl_v, 1);

-- Product: Pink Floral Embroidered Kurti Set
SET @prod_3557 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3557, @cat_coord_set, 'Pink Floral Embroidered Kurti Set', 'pink-floral-embroidered-kurti-set-3557', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '26.jpeg', true);
  SET @3557_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3557_m_v, @prod_3557, '815-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3557_m_v, 1);
  SET @3557_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3557_l_v, @prod_3557, '815-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3557_l_v, 1);
  SET @3557_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3557_xl_v, @prod_3557, '815-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3557_xl_v, 1);
  SET @3557_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3557_xxl_v, @prod_3557, '815-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3557_xxl_v, 1);

-- Product: Green Parrot Embroidered Kurti Set
SET @prod_3131 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3131, @cat_kurti_set, 'Green Parrot Embroidered Kurti Set', 'green-parrot-embroidered-kurti-set-3131', 'Cotton Slub with Embroidery Work', 1499, 1499, '17.jpeg', true);
  SET @3131_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3131_l_v, @prod_3131, '816-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3131_l_v, 1);
  SET @3131_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3131_xl_v, @prod_3131, '816-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3131_xl_v, 1);
  SET @3131_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3131_xxl_v, @prod_3131, '816-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3131_xxl_v, 1);
  SET @3131_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3131_xxxl_v, @prod_3131, '816-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3131_xxxl_v, 1);

-- Product: Red Kurti Set with Embroidered Pockets
SET @prod_2428 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2428, @cat_kurti_set, 'Red Kurti Set with Embroidered Pockets', 'red-kurti-set-with-embroidered-pockets-2428', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '18.jpeg', true);
  SET @2428_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2428_l_v, @prod_2428, '817-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2428_l_v, 1);
  SET @2428_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2428_xl_v, @prod_2428, '817-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2428_xl_v, 1);
  SET @2428_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2428_xxl_v, @prod_2428, '817-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2428_xxl_v, 1);
  SET @2428_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2428_xxxl_v, @prod_2428, '817-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2428_xxxl_v, 1);

-- Product: Black Kurti Set with Embroidered Pockets
SET @prod_2427 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2427, @cat_kurti_set, 'Black Kurti Set with Embroidered Pockets', 'black-kurti-set-with-embroidered-pockets-2427', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '20.jpeg', true);
  SET @2427_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2427_l_v, @prod_2427, '818-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2427_l_v, 1);
  SET @2427_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2427_xl_v, @prod_2427, '818-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2427_xl_v, 1);
  SET @2427_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2427_xxl_v, @prod_2427, '818-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2427_xxl_v, 1);
  SET @2427_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2427_xxxl_v, @prod_2427, '818-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2427_xxxl_v, 1);

-- Product: Purple Kurti Set with Embroidered Pockets
SET @prod_2425 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2425, @cat_kurti_set, 'Purple Kurti Set with Embroidered Pockets', 'purple-kurti-set-with-embroidered-pockets-2425', 'Linen Flex Cotton with Embro.Work', 1399, 1399, '21.jpeg', true);
  SET @2425_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2425_l_v, @prod_2425, '819-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2425_l_v, 1);
  SET @2425_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2425_xl_v, @prod_2425, '819-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2425_xl_v, 1);
  SET @2425_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2425_xxl_v, @prod_2425, '819-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2425_xxl_v, 1);
  SET @2425_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2425_xxxl_v, @prod_2425, '819-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2425_xxxl_v, 1);

-- Product: Yellow Kurti Set with Embroidered Pockets
SET @prod_3433 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3433, @cat_kurti_set, 'Yellow Kurti Set with Embroidered Pockets', 'yellow-kurti-set-with-embroidered-pockets-3433', 'Pure Cambric Cotton with Pocket Embro. Work', 1399, 1399, '22.jpeg', true);
  SET @3433_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3433_l_v, @prod_3433, '820-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3433_l_v, 1);
  SET @3433_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3433_xl_v, @prod_3433, '820-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3433_xl_v, 1);
  SET @3433_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3433_xxl_v, @prod_3433, '820-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3433_xxl_v, 1);
  SET @3433_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3433_xxxl_v, @prod_3433, '820-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3433_xxxl_v, 1);

-- Product: Yellow Embroidered Kurti Set
SET @prod_3631 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3631, @cat_kurti_set, 'Yellow Embroidered Kurti Set', 'yellow-embroidered-kurti-set-3631', 'Pure 60x60 Cambric Cotton with Embro.Work', 1299, 1299, '28.jpeg', true);
  SET @3631_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3631_m_v, @prod_3631, '821-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3631_m_v, 1);
  SET @3631_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3631_l_v, @prod_3631, '821-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3631_l_v, 1);
  SET @3631_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3631_xl_v, @prod_3631, '821-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3631_xl_v, 1);
  SET @3631_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3631_xxl_v, @prod_3631, '821-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3631_xxl_v, 1);

-- Product: Blue Embroidered Kurti Set
SET @prod_3630 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3630, @cat_kurti_set, 'Blue Embroidered Kurti Set', 'blue-embroidered-kurti-set-3630', 'Cotton with Embroidery Work', 1299, 1299, '29.jpeg', true);
  SET @3630_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3630_m_v, @prod_3630, '822-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3630_m_v, 1);
  SET @3630_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3630_l_v, @prod_3630, '822-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3630_l_v, 1);
  SET @3630_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3630_xl_v, @prod_3630, '822-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3630_xl_v, 1);
  SET @3630_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3630_xxl_v, @prod_3630, '822-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3630_xxl_v, 1);

-- Product: Mauve Embroidered Kurti Set
SET @prod_3632 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3632, @cat_kurti_set, 'Mauve Embroidered Kurti Set', 'mauve-embroidered-kurti-set-3632', 'Cotton with Embroidery Work', 1299, 1299, '33.jpeg', true);
  SET @3632_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3632_m_v, @prod_3632, '823-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3632_m_v, 1);
  SET @3632_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3632_l_v, @prod_3632, '823-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3632_l_v, 1);
  SET @3632_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3632_xl_v, @prod_3632, '823-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3632_xl_v, 1);
  SET @3632_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3632_xxl_v, @prod_3632, '823-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3632_xxl_v, 1);

-- Product: Lavender Embroidered Kurti Set
SET @prod_2893 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2893, @cat_kurti_set, 'Lavender Embroidered Kurti Set', 'lavender-embroidered-kurti-set-2893', 'Pure Viscose Rayon with Embro. Work', 1299, 1299, '30.jpeg', true);
  SET @2893_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2893_l_v, @prod_2893, '824-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2893_l_v, 1);
  SET @2893_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2893_xl_v, @prod_2893, '824-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2893_xl_v, 1);
  SET @2893_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2893_xxl_v, @prod_2893, '824-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2893_xxl_v, 1);
  SET @2893_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2893_xxxl_v, @prod_2893, '824-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2893_xxxl_v, 1);

-- Product: Navy Blue Embroidered Kurti Set
SET @prod_3278 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3278, @cat_kurti_set, 'Navy Blue Embroidered Kurti Set', 'navy-blue-embroidered-kurti-set-3278', 'Rayon Jaquard +Lining & Embro. Work', 1299, 1299, '34.jpeg', true);
  SET @3278_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3278_l_v, @prod_3278, '825-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3278_l_v, 1);
  SET @3278_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3278_xl_v, @prod_3278, '825-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3278_xl_v, 1);
  SET @3278_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3278_xxl_v, @prod_3278, '825-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3278_xxl_v, 1);
  SET @3278_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3278_xxxl_v, @prod_3278, '825-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3278_xxxl_v, 1);

-- Product: Teal Embroidered Kurti Set
SET @prod_3277 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3277, @cat_kurti_set, 'Teal Embroidered Kurti Set', 'teal-embroidered-kurti-set-3277', 'Rayon Jaquard +Lining & Embro. Work', 1299, 1299, '36.jpeg', true);
  SET @3277_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3277_l_v, @prod_3277, '826-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3277_l_v, 1);
  SET @3277_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3277_xl_v, @prod_3277, '826-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3277_xl_v, 1);
  SET @3277_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3277_xxl_v, @prod_3277, '826-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3277_xxl_v, 1);
  SET @3277_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3277_xxxl_v, @prod_3277, '826-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3277_xxxl_v, 1);

-- Product: Green Embroidered Kurti Set
SET @prod_3356 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3356, @cat_kurti_set, 'Green Embroidered Kurti Set', 'green-embroidered-kurti-set-3356', 'Pure Cambric Cotton with Work', 1299, 1299, '32.jpeg', true);
  SET @3356_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3356_l_v, @prod_3356, '827-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3356_l_v, 1);
  SET @3356_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3356_xl_v, @prod_3356, '827-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3356_xl_v, 1);
  SET @3356_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3356_xxl_v, @prod_3356, '827-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3356_xxl_v, 1);
  SET @3356_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3356_xxxl_v, @prod_3356, '827-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3356_xxxl_v, 1);

-- Product: Grey Embroidered Kurti Set
SET @prod_2334 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2334, @cat_kurti_set, 'Grey Embroidered Kurti Set', 'grey-embroidered-kurti-set-2334', 'Pure Cambric Cotton with Work', 1299, 1299, '31.jpeg', true);
  SET @2334_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2334_l_v, @prod_2334, '828-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2334_l_v, 1);
  SET @2334_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2334_xl_v, @prod_2334, '828-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2334_xl_v, 1);
  SET @2334_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2334_xxl_v, @prod_2334, '828-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2334_xxl_v, 1);
  SET @2334_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2334_xxxl_v, @prod_2334, '828-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2334_xxxl_v, 1);

-- Product: Pink & Yellow Geometric Print Kurti Set
SET @prod_14628 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_14628, @cat_kurti_set, 'Pink & Yellow Geometric Print Kurti Set', 'pink--yellow-geometric-print-kurti-set-14628', 'Pure Bamboo Silk', 999, 999, '40.jpeg', true);
  SET @14628_s_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14628_s_v, @prod_14628, '829-S', @size_s, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14628_s_v, 1);
  SET @14628_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14628_m_v, @prod_14628, '829-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14628_m_v, 1);
  SET @14628_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14628_l_v, @prod_14628, '829-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14628_l_v, 1);
  SET @14628_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14628_xl_v, @prod_14628, '829-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14628_xl_v, 1);

-- Product: Peach Geometric Print Kurti Set
SET @prod_14625 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_14625, @cat_coord_set, 'Peach Geometric Print Kurti Set', 'peach-geometric-print-kurti-set-14625', 'Pure Bamboo Silk', 999, 999, '41.jpeg', true);
  SET @14625_s_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14625_s_v, @prod_14625, '830-S', @size_s, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14625_s_v, 1);
  SET @14625_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14625_m_v, @prod_14625, '830-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14625_m_v, 1);
  SET @14625_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14625_l_v, @prod_14625, '830-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14625_l_v, 1);
  SET @14625_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14625_xl_v, @prod_14625, '830-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14625_xl_v, 1);
  SET @14625_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@14625_xxl_v, @prod_14625, '830-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @14625_xxl_v, 1);

-- Product: Green & Yellow Floral Print Kurti Set
SET @prod_3625 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3625, @cat_kurti_set, 'Green & Yellow Floral Print Kurti Set', 'green--yellow-floral-print-kurti-set-3625', 'Pure Viscose Rayon', 1299, 1299, '7.jpeg', true);
  SET @3625_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3625_m_v, @prod_3625, '831-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3625_m_v, 1);
  SET @3625_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3625_l_v, @prod_3625, '831-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3625_l_v, 1);
  SET @3625_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3625_xl_v, @prod_3625, '831-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3625_xl_v, 1);
  SET @3625_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3625_xxl_v, @prod_3625, '831-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3625_xxl_v, 1);

-- Product: Black & White Floral Print Co-ord Set
SET @prod_2317 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_2317, @cat_coord_set, 'Black & White Floral Print Co-ord Set', 'black--white-floral-print-coord-set-2317', 'Poly Cotton', 649, 649, '47.jpeg', true);
  SET @2317_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2317_m_v, @prod_2317, '833-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2317_m_v, 1);
  SET @2317_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2317_l_v, @prod_2317, '833-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2317_l_v, 1);
  SET @2317_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2317_xl_v, @prod_2317, '833-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2317_xl_v, 1);
  SET @2317_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2317_xxl_v, @prod_2317, '833-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2317_xxl_v, 1);
  SET @2317_xxxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@2317_xxxl_v, @prod_2317, '833-XXXL', @size_xxxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @2317_xxxl_v, 1);

-- Product: Aqua Green Embroidered Kurti Set
SET @prod_557 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_557, @cat_kurti_set, 'Aqua Green Embroidered Kurti Set', 'aqua-green-embroidered-kurti-set-557', 'Jaquard Silk with Embro.Work', 799, 799, '38.jpeg', true);
  SET @557_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@557_m_v, @prod_557, '834-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @557_m_v, 1);
  SET @557_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@557_l_v, @prod_557, '834-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @557_l_v, 1);
  SET @557_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@557_xl_v, @prod_557, '834-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @557_xl_v, 1);
  SET @557_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@557_xxl_v, @prod_557, '834-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @557_xxl_v, 1);

-- Product: Beige Striped Kurti Set
SET @prod_16762 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_16762, @cat_kurti_set, 'Beige Striped Kurti Set', 'beige-striped-kurti-set-16762', 'Weaving Cotton', 649, 649, '37.jpeg', true);
  SET @16762_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@16762_m_v, @prod_16762, '835-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @16762_m_v, 1);
  SET @16762_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@16762_l_v, @prod_16762, '835-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @16762_l_v, 1);
  SET @16762_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@16762_xl_v, @prod_16762, '835-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @16762_xl_v, 1);
  SET @16762_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@16762_xxl_v, @prod_16762, '835-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @16762_xxl_v, 1);

-- Product: Light Green Jaquard Straight Kurti
SET @prod_3675 = UUID();
INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) 
VALUES (@prod_3675, @cat_kurti_set, 'Light Green Jaquard Straight Kurti', 'light-green-jaquard-straight-kurti-3675', 'Cotton Jaquard', 299, 299, '9.jpeg', true);
  SET @3675_m_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3675_m_v, @prod_3675, '836-M', @size_m, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3675_m_v, 1);
  SET @3675_l_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3675_l_v, @prod_3675, '836-L', @size_l, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3675_l_v, 1);
  SET @3675_xl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3675_xl_v, @prod_3675, '836-XL', @size_xl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3675_xl_v, 1);
  SET @3675_xxl_v = UUID();
  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES (@3675_xxl_v, @prod_3675, '836-XXL', @size_xxl, true);
  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), @3675_xxl_v, 1);

