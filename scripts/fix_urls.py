import glob
import re

files = ["index.html"] + glob.glob("**/index.html", recursive=True)
count = 0
for fpath in files:
    try:
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        new_content = re.sub(r'(href|src)=(["\'])//', r'\1=\2https://', content)
        if new_content != content:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1
    except Exception as e:
        print(f"Error reading {fpath}: {e}")

print(f"Fixed protocol-relative URLs in {count} HTML files.")
