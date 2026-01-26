import csv
import base64
import os
import requests
import mysql.connector
from dotenv import load_dotenv

# Load database credentials from backend/.env
load_dotenv(dotenv_path='backend/.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

BASE_URL = "http://localhost:5000/api"
CSV_PATH = "admin/plist1.csv"
IMAGES_DIR = "png_files"

def get_image_base64(filename):
    """Converts an image file to a Base64 string."""
    # Swap extension to .webp as requested
    base_filename = os.path.splitext(filename)[0]
    webp_filename = f"{base_filename}.webp"
    filepath = os.path.join(IMAGES_DIR, webp_filename)
    
    if not os.path.exists(filepath):
        print(f"Warning: File not found: {filepath}")
        return None
    try:
        with open(filepath, "rb") as image_file:
            mime_type = "image/webp"
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return f"data:{mime_type};base64,{encoded_string}"
    except Exception as e:
        print(f"Error encoding image {filename}: {e}")
        return None

def update_product_image(product_id, base64_image):
    """Sends an API request to update the product's featured image."""
    url = f"{BASE_URL}/products/{product_id}"
    payload = {
        "mainImage": base64_image
    }
    try:
        response = requests.put(url, json=payload)
        if response.status_code == 200:
            print(f"Successfully updated product {product_id}")
            return True
        else:
            print(f"Failed to update product {product_id}. Status: {response.status_code}, Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error connecting to API for product {product_id}: {e}")
        return False

def main():
    # 1. Read CSV mapping
    # Format: SL NO|bill|dcode|file|barcode|s.rate|c.rate|S|M|L|Xl|XXL|XXXL|Total Qty|Amount||Descrption||Fabric|Img file name|Product||
    # We need 'Descrption' (column 16, index 16) and 'Img file name' (column 19, index 19)
    # The delimiter is |
    mapping = {}
    print(f"Reading CSV: {CSV_PATH}")
    with open(CSV_PATH, mode='r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter='|')
        header = next(reader)
        for row in reader:
            if len(row) > 19:
                description = row[16].strip()
                filename = row[19].strip()
                if description and filename:
                    mapping[description] = filename

    if not mapping:
        print("No mapping found in CSV.")
        return

    print(f"Found {len(mapping)} mappings in CSV.")

    # 2. Get all products from database
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM products")
        db_products = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")
        return

    print(f"Fetched {len(db_products)} products from database.")

    # 3. Process each product
    updated_count = 0
    for product in db_products:
        product_name = product['name'].strip()
        product_id = product['id']

        if product_name in mapping:
            filename = mapping[product_name]
            print(f"Processing: {product_name} -> {filename}")
            
            base64_image = get_image_base64(filename)
            if base64_image:
                if update_product_image(product_id, base64_image):
                    updated_count += 1
        else:
            # Try partial match if exact match fails
            # For example, "Red & Beige Floral Print Kurti Set" might have extra chars in CSV or DB
            # But based on my check, they match quite well.
            pass

    print(f"\nUpdate complete. Total products updated: {updated_count}")

if __name__ == "__main__":
    main()
