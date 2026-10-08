import os
import glob
from xml.etree import ElementTree as ET

domain = "https://arwebcrafts.com"
dirs = glob.glob("**/index.html", recursive=True)

valid_paths = set()
for d in dirs:
    path = os.path.dirname(d)
    if path == "" or path == ".":
        valid_paths.add("/")
    else:
        # Ignore deleted/junk
        if not any(spam in path for spam in ["casino", "luck-", "roulette", "bof-", "volt-", "spins-"]):
            valid_paths.add("/" + path.replace("\\", "/") + "/")

urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

for p in sorted(valid_paths):
    url_elem = ET.SubElement(urlset, "url")
    loc = ET.SubElement(url_elem, "loc")
    loc.text = domain + p
    priority = ET.SubElement(url_elem, "priority")
    priority.text = "1.0" if p == "/" else "0.8"

tree = ET.ElementTree(urlset)
ET.indent(tree, space="  ")
tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)
print(f"Generated clean sitemap.xml with {len(valid_paths)} valid URLs.")
