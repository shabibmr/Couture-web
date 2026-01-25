import sys
import os
from PIL import Image
from pathlib import Path
import argparse

def convert_to_webp(file_path, quality=80):
    """
    Converts a single image file to WebP format.
    """
    path = Path(file_path)
    
    if not path.exists():
        print(f"Error: File '{file_path}' not found.")
        return False
        
    try:
        # Open the image
        img = Image.open(path)
        
        # Prepare the output path (same name, .webp extension)
        output_path = path.with_suffix(".webp")
        
        # Convert and save
        img.save(output_path, "WEBP", quality=quality)
        
        original_size = os.path.getsize(path)
        new_size = os.path.getsize(output_path)
        reduction = (1 - new_size / original_size) * 100
        
        print(f"Successfully converted: {path.name} -> {output_path.name}")
        print(f"Original: {original_size/1024:.1f}KB")
        print(f"WebP: {new_size/1024:.1f}KB (Reduced by {reduction:.1f}%)")
        return True
        
    except Exception as e:
        print(f"Failed to convert {path.name}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Convert an image file to WebP format.")
    parser.add_argument("input_file", help="Path to the image file to convert (PNG, JPG, etc.)")
    parser.add_argument("--quality", type=int, default=80, help="WebP compression quality (1-100, default: 80)")
    
    args = parser.parse_args()
    
    # Check if Pillow is installed
    try:
        import PIL
    except ImportError:
        print("Error: The 'Pillow' library is required. Install it using: pip install Pillow")
        sys.exit(1)
        
    convert_to_webp(args.input_file, args.quality)

if __name__ == "__main__":
    main()
