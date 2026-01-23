import csv
import re
import uuid

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9 ]', '', text)
    text = text.replace(' ', '-')
    return text

def clean_text(text):
    text = text.replace('\\u0026', '&')
    text = text.replace('&', '&') # Ensure & is handled properly if needed, but plain text was requested
    text = text.replace('  ', ' ').strip()
    return text

input_file = '/Users/admin/code/ruveraweb/Couture-web/admin/plist1.csv'
output_file = '/Users/admin/code/ruveraweb/Couture-web/admin/insert_products.sql'

categories = set()
products = []

with open(input_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='|')
    for row in reader:
        if not row.get('Descrption'): continue
        
        product_type = clean_text(row['Product'])
        if product_type:
            categories.add(product_type)
            
        products.append({
            'dcode': row['dcode'],
            'barcode': row['barcode'],
            'selling_rate': row['s.rate'],
            'cost_rate': row['c.rate'],
            'S': row.get('S', '0'),
            'M': row.get('M', '0'),
            'L': row.get('L', '0'),
            'XL': row.get('Xl', '0'),
            'XXL': row.get('XXL', '0'),
            'XXXL': row.get('XXXL', '0'),
            'description': clean_text(row['Descrption']),
            'fabric': clean_text(row['Fabric']),
            'image': row['Img file name'],
            'category': product_type
        })

with open(output_file, mode='w', encoding='utf-8') as f:
    f.write("-- SQL Dump generated from plist1.csv (MySQL Compatible)\n")
    f.write("USE couture_db;\n\n")

    # 1. Handle Sizes
    f.write("-- Ensure standard sizes exist\n")
    size_map = {
        'S': 'Small',
        'M': 'Medium',
        'L': 'Large',
        'XL': 'Extra Large',
        'XXL': 'XX Large',
        'XXXL': 'XXX Large'
    }
    for code, name in size_map.items():
        var_name = f"@size_{code.lower()}"
        # Use INSERT IGNORE to prevent duplicate errors if the record exists
        # Note: id is generated on the fly if not exists
        f.write(f"INSERT IGNORE INTO sizes (id, name, code, size_group) VALUES (UUID(), '{name}', '{code}', 'clothing');\n")
        f.write(f"SET {var_name} = (SELECT id FROM sizes WHERE code = '{code}' LIMIT 1);\n")
    f.write("\n")

    # 2. Handle Categories
    f.write("-- Categories\n")
    cat_var_map = {}
    for cat in sorted(list(categories)):
        slug = slugify(cat)
        var_name = f"@cat_{slug.replace('-', '_')}"
        cat_var_map[cat] = var_name
        f.write(f"INSERT IGNORE INTO categories (id, name, slug, description, is_active) VALUES (UUID(), '{cat}', '{slug}', '{cat} Products', true);\n")
        f.write(f"SET {var_name} = (SELECT id FROM categories WHERE slug = '{slug}' LIMIT 1);\n")
    f.write("\n")

    # 3. Products, Variants & Inventory
    f.write("-- Products, Variants and Inventory\n")
    for p in products:
        p_uuid_var = f"@prod_{p['dcode']}"
        p_name = p['description'].replace("'", "''")
        p_slug = slugify(p['description']) + "-" + p['dcode']
        cat_var = cat_var_map.get(p['category'], "NULL")
        
        f.write(f"-- Product: {p_name}\n")
        f.write(f"SET {p_uuid_var} = UUID();\n")
        f.write(f"INSERT INTO products (id, category_id, name, slug, description, base_price, sale_price, featured_image, is_active) \n")
        f.write(f"VALUES ({p_uuid_var}, {cat_var}, '{p_name}', '{p_slug}', '{p['fabric']}', {p['selling_rate']}, {p['selling_rate']}, '{p['image']}', true);\n")
        
        # Variants
        for size_code in ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']:
            qty = p[size_code]
            if qty and qty.strip() and qty.strip() != '0':
                v_uuid_var = f"@{p['dcode']}_{size_code.lower()}_v"
                size_var = f"@size_{size_code.lower()}"
                sku = f"{p['barcode']}-{size_code}"
                
                f.write(f"  SET {v_uuid_var} = UUID();\n")
                f.write(f"  INSERT INTO product_variants (id, product_id, sku, size_id, is_active) VALUES ({v_uuid_var}, {p_uuid_var}, '{sku}', {size_var}, true);\n")
                f.write(f"  INSERT INTO inventory (id, variant_id, quantity) VALUES (UUID(), {v_uuid_var}, {qty});\n")
        f.write("\n")

print(f"SQL dump generated at {output_file}")
