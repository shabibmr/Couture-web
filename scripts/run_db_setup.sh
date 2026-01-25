#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "\033[31mError: .env file not found at backend/.env\033[0m"
    exit 1
fi

# Load variables from .env
# This part handles potential spaces or special characters
DB_HOST=$(grep DB_HOST "$ENV_FILE" | cut -d '=' -f2 | xargs)
DB_PORT=$(grep DB_PORT "$ENV_FILE" | cut -d '=' -f2 | xargs)
DB_NAME=$(grep DB_NAME "$ENV_FILE" | cut -d '=' -f2 | xargs)
DB_USER=$(grep DB_USER "$ENV_FILE" | cut -d '=' -f2 | xargs)
DB_PASS=$(grep DB_PASSWORD "$ENV_FILE" | cut -d '=' -f2 | xargs)

echo -e "\033[36mSetting up MySQL database: $DB_NAME...\033[0m"

# Export password for mysql command (to avoid interactive prompt)
export MYSQL_PWD="$DB_PASS"

# Drop existing database if it exists (to ensure clean state)
echo "Dropping existing database if present..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "DROP DATABASE IF EXISTS $DB_NAME;"

# Create database
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo -e "\033[32mDatabase '$DB_NAME' ready.\033[0m"
else
    echo -e "\033[31mError: Could not create/access database. Check your .env values and MySQL status.\033[0m"
    exit 1
fi

echo "Importing schema from setup_db_mysql.sql..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$ROOT/setup_db_mysql.sql"

if [ $? -eq 0 ]; then
    echo -e "\033[32mSchema imported successfully.\033[0m"
    
    # Optional: Seed the banner if it exists
    if [ -f "$ROOT/backend/seed_banner.sql" ]; then
        echo "Seeding initial data..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$ROOT/backend/seed_banner.sql"
        echo -e "\033[32mSeed data imported.\033[0m"
    fi
else
    echo -e "\033[31mError: Schema import failed.\033[0m"
    exit 1
fi

# Unset password
unset MYSQL_PWD

echo "----------------------------------"
echo -e "\033[32mDatabase setup complete!\033[0m"
echo "----------------------------------"
