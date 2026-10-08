import glob
import re

files = ["index.html"] + glob.glob("**/index.html", recursive=True)
count = 0

for fpath in files:
    # Skip about-us and privacy-policy
    if "about-us" in fpath or "privacy-policy" in fpath or "about/" in fpath:
        continue

    try:
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Remove "US-registered Company" and "US Registered Company" and variations
        new_content = re.sub(r'</br>\s*US-registered Company', '', content, flags=re.IGNORECASE)
        new_content = re.sub(r'<br/?>\s*US-registered Company', '', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'US-registered Company', '', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'US-registered', '', new_content, flags=re.IGNORECASE)
        new_content = re.sub(r'US Registered Company', '', new_content, flags=re.IGNORECASE)

        if new_content != content:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1
    except Exception as e:
        print(f"Error on {fpath}: {e}")

print(f"Cleaned 'US-registered company' text from {count} HTML files.")
