import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        port=os.getenv('DB_PORT', 3306)
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, slug, featured_image FROM products LIMIT 10")
    products = cursor.fetchall()
    for product in products:
        print(product)
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
