import os
import glob
import re

# Collect all referenced image filenames in html, css, js
files = glob.glob('**/*.html', recursive=True) + glob.glob('**/*.css', recursive=True) + glob.glob('**/*.js', recursive=True) + ['index.html']
files = list(set(files))

referenced_images = set()
for fpath in files:
    if 'node_modules' in fpath or '.next' in fpath:
        continue
    try:
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        matches = re.findall(r'/wp-content/uploads/[^\s"\'\?]+\.(?:webp|png|jpg|jpeg|svg|gif)', content, flags=re.IGNORECASE)
        for m in matches:
            referenced_images.add(os.path.normpath(m.lstrip('/')))
    except Exception as e:
        pass

print(f"Total unique referenced image paths in site code: {len(referenced_images)}")

# Check files in wp-content/uploads
removed_count = 0
freed_bytes = 0

for root, _, fnames in os.walk('wp-content/uploads'):
    for fname in fnames:
        full_path = os.path.normpath(os.path.join(root, fname))
        ext = os.path.splitext(fname)[1].lower()
        
        # If it's a legacy png/jpg/jpeg whose webp exists and is referenced, or unreferenced image
        if ext in ('.png', '.jpg', '.jpeg'):
            webp_path = os.path.splitext(full_path)[0] + '.webp'
            if os.path.exists(webp_path) and (webp_path in referenced_images or full_path not in referenced_images):
                try:
                    freed_bytes += os.path.getsize(full_path)
                    os.remove(full_path)
                    removed_count += 1
                except Exception as e:
                    pass

print(f"Cleaned up {removed_count} unneeded legacy PNG/JPG image files (Freed {freed_bytes / (1024*1024):.2f} MB).")
