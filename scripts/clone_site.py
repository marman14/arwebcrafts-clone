import os
import sys
import re
import time
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from html.parser import HTMLParser

BASE_URL = "https://www.arwebcrafts.com"
ALT_BASE_URL = "https://arwebcrafts.com"
ROOT_DIR = Path(__file__).resolve().parent.parent

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
}

class AssetExtractor(HTMLParser):
    """Extract all asset URLs and internal links from HTML."""
    def __init__(self, page_url):
        super().__init__()
        self.page_url = page_url
        self.assets = set()
        self.links = set()

    def handle_starttag(self, tag, attrs):
        attrs_dict = {k.lower(): v for k, v in attrs if v is not None}
        
        # Stylesheets & Icons
        if tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href")
            if href:
                if any(x in rel for x in ["stylesheet", "icon", "preload", "prefetch", "apple-touch-icon"]):
                    self.assets.add(self.resolve_url(href))
        
        # Scripts
        elif tag == "script":
            src = attrs_dict.get("src")
            if src:
                self.assets.add(self.resolve_url(src))
                
        # Images & Sources
        elif tag in ["img", "source"]:
            for attr in ["src", "data-src", "data-lazy-src", "data-orig-src"]:
                if attr in attrs_dict:
                    self.assets.add(self.resolve_url(attrs_dict[attr]))
            
            for attr in ["srcset", "data-srcset"]:
                if attr in attrs_dict:
                    srcset = attrs_dict[attr]
                    for entry in srcset.split(","):
                        parts = entry.strip().split()
                        if parts:
                            self.assets.add(self.resolve_url(parts[0]))
                            
        # Video & Audio
        elif tag in ["video", "audio"]:
            src = attrs_dict.get("src")
            if src:
                self.assets.add(self.resolve_url(src))
            poster = attrs_dict.get("poster")
            if poster:
                self.assets.add(self.resolve_url(poster))

        # Inline style background images
        style = attrs_dict.get("style", "")
        if "url(" in style.lower():
            for match in re.findall(r'url\s*\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)', style, re.I):
                self.assets.add(self.resolve_url(match))
                
        # Links
        if tag == "a":
            href = attrs_dict.get("href")
            if href:
                resolved = self.resolve_url(href)
                if resolved and (resolved.startswith(BASE_URL) or resolved.startswith(ALT_BASE_URL)):
                    self.links.add(resolved)

    def resolve_url(self, url):
        if not url:
            return None
        url = url.strip()
        if url.startswith("data:") or url.startswith("javascript:") or url.startswith("mailto:") or url.startswith("tel:"):
            return None
        if url.startswith("#"):
            return None
        return urllib.parse.urljoin(self.page_url, url)

def get_clean_asset_path(url):
    """Return local relative path for a given asset URL."""
    parsed = urllib.parse.urlparse(url)
    clean_path = parsed.path.lstrip("/")
    if not clean_path:
        clean_path = "index.html"
    return clean_path

def download_asset(url, retries=3):
    """Download a static asset and save to disk."""
    try:
        parsed = urllib.parse.urlparse(url)
        # Only download assets from arwebcrafts or static assets needed
        if not (parsed.netloc.endswith("arwebcrafts.com") or "fonts.googleapis.com" in parsed.netloc or "fonts.gstatic.com" in parsed.netloc):
            return None, False, "external non-essential"
            
        clean_path = parsed.path.lstrip("/")
        if not clean_path:
            return None, False, "empty path"
            
        local_path = ROOT_DIR / clean_path
        if local_path.exists() and local_path.stat().st_size > 0:
            return clean_path, True, "exists"
            
        local_path.parent.mkdir(parents=True, exist_ok=True)
        
        for attempt in range(retries):
            try:
                req = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=20) as resp:
                    if resp.status == 200:
                        content = resp.read()
                        with open(local_path, "wb") as f:
                            f.write(content)
                        return clean_path, True, f"downloaded ({len(content)} B)"
                    elif resp.status == 404:
                        return clean_path, False, "404"
            except Exception as e:
                if attempt == retries - 1:
                    return clean_path, False, str(e)
                time.sleep(1)
    except Exception as e:
        return None, False, str(e)
    return None, False, "unknown"

def extract_css_assets(css_content, css_base_url):
    """Extract all url() references from CSS (fonts, background images)."""
    found = set()
    # Match url(...)
    matches = re.findall(r'url\s*\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)', css_content, re.I)
    for m in matches:
        m = m.strip()
        if m.startswith("data:") or m.startswith("#"):
            continue
        # strip query parameters like ?v=4.7.0 for resolution if needed, but join with full url
        resolved = urllib.parse.urljoin(css_base_url, m)
        found.add(resolved)
    return found

def get_all_sitemap_pages():
    """Extract all pages, posts, templates, and categories from sitemaps."""
    sitemap_index = f"{BASE_URL}/sitemap_index.xml"
    pages = set()
    pages.add(f"{BASE_URL}/")
    
    try:
        req = urllib.request.Request(sitemap_index, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            root = ET.fromstring(resp.read())
            sub_sitemaps = [elem.text for elem in root.findall(".//{*}loc") if elem.text]
            
        for sm in sub_sitemaps:
            print(f"Reading sub-sitemap: {sm}")
            try:
                r = urllib.request.Request(sm, headers=HEADERS)
                with urllib.request.urlopen(r, timeout=20) as res:
                    sm_root = ET.fromstring(res.read())
                    for url_elem in sm_root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
                        loc = url_elem.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
                        if loc is not None and loc.text:
                            pages.add(loc.text.strip())
            except Exception as e:
                print(f"Error loading {sm}: {e}")
    except Exception as e:
        print(f"Error loading sitemap index: {e}")

    # Explicitly guarantee core service & key pages are in the list
    core_pages = [
        f"{BASE_URL}/",
        f"{BASE_URL}/services/",
        f"{BASE_URL}/about-us/",
        f"{BASE_URL}/contact-us/",
        f"{BASE_URL}/products/",
        f"{BASE_URL}/portfolio/",
        f"{BASE_URL}/maintenance/",
        f"{BASE_URL}/hire-a-full-stack-wordpress-developer/",
        f"{BASE_URL}/wordpress-plugin-development/",
        f"{BASE_URL}/wordpress-theme-development-services/",
        f"{BASE_URL}/woocommerce-custom-development/",
        f"{BASE_URL}/learndash-customization-services/",
        f"{BASE_URL}/learndash-migration-services/",
        f"{BASE_URL}/learndash-maintenance-services/",
        f"{BASE_URL}/wordpress-plugin-maintenance-services/",
        f"{BASE_URL}/woocommerce-maintenance-services/",
        f"{BASE_URL}/api-integrations-services/",
        f"{BASE_URL}/workflow-automation-services/",
        f"{BASE_URL}/ai-automation/",
        f"{BASE_URL}/ecommerce-website-development-services/",
        f"{BASE_URL}/custom-websites-services/",
        f"{BASE_URL}/custom-wordpress-development/",
        f"{BASE_URL}/free-quote/",
        f"{BASE_URL}/terms-and-conditions/",
        f"{BASE_URL}/privacy-policy/",
        f"{BASE_URL}/blog/",
        f"{BASE_URL}/elementskit-content/dynamic-content-megamenu-menuitem1074/",
        f"{BASE_URL}/elementskit-content/dynamic-content-megamenu-menuitem160/",
    ]
    for cp in core_pages:
        pages.add(cp)
        
    return sorted(list(pages))

def clean_and_rewrite_html(html, current_url):
    """Rewrite HTML to work 100% locally and offline."""
    # 1. Normalize lazy loaded images: if src is a tiny placeholder and data-src exists, set src=data-src
    def replace_img_src(match):
        img_tag = match.group(0)
        data_src_match = re.search(r'data-src=[\'"]([^\'"]+)[\'"]', img_tag)
        if data_src_match:
            real_src = data_src_match.group(1)
            # if current src is data:image/ or base64 placeholder
            if 'src="data:image' in img_tag or "src='data:image" in img_tag:
                img_tag = re.sub(r'src=[\'"][^\'"]*[\'"]', f'src="{real_src}"', img_tag)
        return img_tag

    html = re.sub(r'<img[^>]+>', replace_img_src, html)

    # 2. Rewrite domain URLs to local root paths
    html = html.replace(f"{BASE_URL}/", "/")
    html = html.replace(f"{ALT_BASE_URL}/", "/")
    html = html.replace(BASE_URL, "")
    html = html.replace(ALT_BASE_URL, "")

    # 3. Disable external tracking beacons that may cause console spam offline
    html = html.replace("https://www.googletagmanager.com/gtm.js", "")
    html = html.replace("https://www.google-analytics.com/analytics.js", "")
    html = html.replace("https://static.cloudflareinsights.com/beacon.min.js", "")

    return html

def save_page_html(url, html_content):
    """Save HTML content to the appropriate local index.html or filename."""
    parsed = urllib.parse.urlparse(url)
    clean_path = parsed.path.lstrip("/")
    
    if not clean_path or clean_path == "/":
        target = ROOT_DIR / "index.html"
    elif clean_path.endswith(".html") or clean_path.endswith(".xml") or clean_path.endswith(".txt"):
        target = ROOT_DIR / clean_path
    else:
        if clean_path.endswith("/"):
            clean_path = clean_path[:-1]
        target = ROOT_DIR / clean_path / "index.html"
        
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8", errors="ignore") as f:
        f.write(html_content)
    return target

def main():
    start_time = time.time()
    print("======================================================================")
    print("      AR WEBCRAFTS COMPLETE WEBSITE CLONING & ASSET ENGINE             ")
    print("======================================================================")
    print(f"Destination: {ROOT_DIR}\n")
    
    # Step 1: Collect All URLs
    print("[1/5] Discovering all website URLs from sitemaps...")
    all_pages = get_all_sitemap_pages()
    print(f"Total pages and articles discovered: {len(all_pages)}")

    # Step 2: Crawl HTML Pages and Collect Assets
    print(f"\n[2/5] Crawling {len(all_pages)} HTML pages concurrently...")
    all_assets = set()
    raw_pages = {}
    
    def fetch_page(url):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                if resp.status == 200:
                    content = resp.read().decode("utf-8", errors="ignore")
                    extractor = AssetExtractor(url)
                    extractor.feed(content)
                    return url, content, extractor.assets, None
                return url, None, set(), f"HTTP {resp.status}"
        except Exception as e:
            return url, None, set(), str(e)

    success_pages = 0
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(fetch_page, u): u for u in all_pages}
        for future in as_completed(futures):
            url, content, assets, err = future.result()
            if content:
                raw_pages[url] = content
                for a in assets:
                    if a:
                        all_assets.add(a)
                success_pages += 1
                if success_pages % 20 == 0 or success_pages == len(all_pages):
                    print(f"  Processed {success_pages}/{len(all_pages)} pages | Discovered {len(all_assets)} unique assets")
            else:
                print(f"  Failed {url}: {err}")

    print(f"\nSuccessfully downloaded {success_pages} pages!")
    print(f"Total primary assets discovered: {len(all_assets)}")

    # Step 3: Download Assets & Parse CSS Recursively for Fonts/Images
    print("\n[3/5] Downloading primary assets & discovering CSS fonts/images...")
    downloaded_assets = set()
    css_files_to_scan = set()

    def handle_asset_download(asset_url):
        clean_path, success, msg = download_asset(asset_url)
        return asset_url, clean_path, success, msg

    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(handle_asset_download, a): a for a in all_assets}
        count = 0
        for future in as_completed(futures):
            asset_url, clean_path, success, msg = future.result()
            count += 1
            if success and clean_path:
                downloaded_assets.add(clean_path)
                if clean_path.endswith(".css"):
                    css_files_to_scan.add((ROOT_DIR / clean_path, asset_url))
            if count % 100 == 0 or count == len(all_assets):
                print(f"  Downloaded {count}/{len(all_assets)} primary assets...")

    # Step 4: Scan CSS Files for Embedded Fonts, SVGs, and Background Images
    print(f"\n[4/5] Scanning {len(css_files_to_scan)} CSS files for fonts and background graphics...")
    secondary_assets = set()
    for local_css_path, css_url in css_files_to_scan:
        try:
            with open(local_css_path, "r", encoding="utf-8", errors="ignore") as f:
                css_data = f.read()
                found = extract_css_assets(css_data, css_url)
                for f_url in found:
                    if f_url not in all_assets:
                        secondary_assets.add(f_url)
        except Exception as e:
            pass

    print(f"Discovered {len(secondary_assets)} secondary assets (fonts, icons, graphics) referenced in CSS.")
    print("Downloading secondary assets...")
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(handle_asset_download, a): a for a in secondary_assets}
        count = 0
        for future in as_completed(futures):
            asset_url, clean_path, success, msg = future.result()
            count += 1
            if success and clean_path:
                downloaded_assets.add(clean_path)
            if count % 50 == 0 or count == len(secondary_assets):
                print(f"  Downloaded {count}/{len(secondary_assets)} secondary assets...")

    # Step 5: Rewrite and Save HTML Pages with Clean Local Paths
    print(f"\n[5/5] Rewriting {len(raw_pages)} HTML pages for offline local navigation & SEO preservation...")
    saved_count = 0
    for page_url, html_content in raw_pages.items():
        clean_html = clean_and_rewrite_html(html_content, page_url)
        save_page_html(page_url, clean_html)
        saved_count += 1
        if saved_count % 30 == 0 or saved_count == len(raw_pages):
            print(f"  Saved {saved_count}/{len(raw_pages)} HTML pages.")

    # Also download robots.txt and sitemap
    print("\nFetching robots.txt and sitemaps...")
    download_asset(f"{BASE_URL}/robots.txt")
    download_asset(f"{BASE_URL}/sitemap_index.xml")
    download_asset(f"{BASE_URL}/page-sitemap.xml")
    download_asset(f"{BASE_URL}/post-sitemap.xml")
    
    elapsed = time.time() - start_time
    print("\n======================================================================")
    print(f" CLONING COMPLETE in {elapsed:.1f} seconds!")
    print(f" - Pages Saved: {saved_count}")
    print(f" - Assets Downloaded: {len(downloaded_assets)}")
    print(f" - Location: {ROOT_DIR}")
    print("======================================================================")

if __name__ == "__main__":
    main()
