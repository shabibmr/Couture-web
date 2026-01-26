#!/bin/bash

# Configuration
PNG_DIR="./png_files"
PYTHON_SCRIPT="convert_to_webp.py"
QUALITY=80

# Check if directory exists
if [ ! -d "$PNG_DIR" ]; then
    echo "Error: Directory $PNG_DIR not found."
    exit 1
fi

# Check if python script exists
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "Error: Script $PYTHON_SCRIPT not found."
    exit 1
fi

echo "Starting conversion of PNG files in $PNG_DIR..."

# Count files
total_files=$(ls "$PNG_DIR"/*.png 2>/dev/null | wc -l)
echo "Found $total_files PNG files."

# Iterate and convert
count=0
for file in "$PNG_DIR"/*.png; do
    if [ -f "$file" ]; then
        count=$((count + 1))
        echo "[$count/$total_files] Converting $file..."
        python3 "$PYTHON_SCRIPT" "$file" --quality "$QUALITY"
    fi
done

echo "Conversion complete! $count files processed."
