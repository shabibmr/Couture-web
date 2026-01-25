import os
from PIL import Image
from pathlib import Path
import sys

# Define paths
BASE_DIR = Path(__file__).resolve().parent
SOURCE_DIR = BASE_DIR / "prodimages"
WEBP_DIR = SOURCE_DIR  # We can save side-by-side or in a subfolder. Side-by-side is easier for now.

def optimize_images():
    if not SOURCE_DIR.exists():
        print(f"Error: Directory {SOURCE_DIR} not found.")
        return

    files = list(SOURCE_DIR.glob("*.png"))
    if not files:
        print("No PNG files found in prodimages.")
        return

    print(f"Found {len(files)} PNG images. Starting conversion to WebP...")
    
    saved_space = 0
    
    for file in files:
        try:
            img = Image.open(file)
            
            # Create WebP filename
            webp_path = file.with_suffix(".webp")
            
            # Convert and save
            # quality=80 is a good balance for fashion images
            img.save(webp_path, "WEBP", quality=80)
            
            original_size = os.path.getsize(file)
            new_size = os.path.getsize(webp_path)
            saved = original_size - new_size
            saved_space += saved
            
            print(f"Converted {file.name}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (Saved {saved/1024:.1f}KB)")
            
        except Exception as e:
            print(f"Failed to convert {file.name}: {e}")

    print(f"\nTotal space saved: {saved_space/1024/1024:.2f} MB")
    print("Optimization complete.")

if __name__ == "__main__":
    # Check if Pillow is installed
    try:
        import PIL
        optimize_images()
    except ImportError:
        print("Pillow library not found. Please run: pip install Pillow")
