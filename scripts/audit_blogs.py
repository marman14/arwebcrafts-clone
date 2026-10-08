import glob
import re
import os

blog_files = glob.glob("blog/**/index.html", recursive=True)
print(f"Total Blog Post HTML files to audit: {len(blog_files)}")

issues_found = 0
for fpath in blog_files:
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    # 1. Check title
    title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
    title = title_match.group(1) if title_match else "NO TITLE"

    # 2. Check meta description
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
    desc = desc_match.group(1) if desc_match else "NO DESC"

    # 3. Check for spam terms
    spam_match = re.search(r'casino|gambling|poker|betting|slot|roulette', html, re.IGNORECASE)
    if spam_match:
        print(f"WARNING: Spam keyword found in {fpath}: '{spam_match.group(0)}'")
        issues_found += 1

    # 4. Check for broken local images
    imgs = re.findall(r'src=["\'](/wp-content/[^"\'\?]+)', html)
    missing_imgs = [img for img in imgs if not os.path.exists(img.lstrip('/'))]
    if missing_imgs:
        print(f"Broken image paths in {fpath}: {len(missing_imgs)}")
        issues_found += 1

print(f"\nAudit completed. Total issues flagged: {issues_found}")
