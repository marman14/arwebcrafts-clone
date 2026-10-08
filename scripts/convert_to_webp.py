import os
import glob
import re
from PIL import Image

uploads_dir = 'wp-content/uploads'
converted = 0
errors = 0

for root, _, files in os.walk(uploads_dir):
    for fname in files:
        if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(root, fname)
            webp_path = os.path.splitext(img_path)[0] + '.webp'
            
            if not os.path.exists(webp_path):
                try:
                    with Image.open(img_path) as img:
                        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                            img = img.convert('RGBA')
                        else:
                            img = img.convert('RGB')
                        img.save(webp_path, 'WEBP', quality=82, method=4)
                        converted += 1
                except Exception as e:
                    errors += 1

print(f"Converted {converted} images to WebP ({errors} errors).")

# Update references in all HTML and CSS files
html_files = glob.glob('**/*.html', recursive=True) + glob.glob('**/*.css', recursive=True) + ['index.html']
html_files = list(set(html_files))

updated_files = 0
for fpath in html_files:
    if 'node_modules' in fpath or '.next' in fpath:
        continue
    try:
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Replace .png, .jpg, .jpeg with .webp in image paths
        new_content = re.sub(r'(/wp-content/uploads/[^\s"\'\?]+\.)(?:png|jpg|jpeg)', r'\1webp', content, flags=re.IGNORECASE)
        
        if new_content != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated_files += 1
    except Exception as e:
        pass

print(f"Updated WebP references in {updated_files} HTML/CSS files.")
