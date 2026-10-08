import glob
import re

files = glob.glob("**/*.html", recursive=True) + glob.glob("**/*.js", recursive=True) + ["index.html"]
files = list(set(files))

count = 0
for fpath in files:
    if "node_modules" in fpath or ".git" in fpath or ".next" in fpath:
        continue
    try:
        with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Replace UK phone number formats with US phone number +1-307-278-4862
        new_content = re.sub(r'\+44\s?\(?0\)?\s?\d{2,5}\s?\d{3,6}\s?\d{3,6}', '+1-307-278-4862', content)
        new_content = re.sub(r'\+44\d{9,11}', '+1-307-278-4862', new_content)
        new_content = re.sub(r'020\s?\d{4}\s?\d{4}', '+1-307-278-4862', new_content)
        new_content = re.sub(r'020\d{8}', '+1-307-278-4862', new_content)

        if new_content != content:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(new_content)
            count += 1
    except Exception as e:
        print(f"Error in {fpath}: {e}")

print(f"Replaced UK numbers in {count} files.")
