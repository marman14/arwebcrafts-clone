import os
import shutil
import glob
import re

dirs = [d for d in os.listdir('.') if os.path.isdir(d) and not d.startswith('.')]

core_stay_root = {
    'about', 'about-us', 'contact-us', 'services', 'portfolio', 'pricing', 
    'privacy-policy', 'terms-and-conditions', 'free-quote', 'blog', 'products', 
    'case-studies', 'wp-content', 'wp-includes', 'scripts', 'api', 'author', 
    'category', 'tag', 'my-account', 'checkout', 'realtorz-crm', 'workplace-policy', 
    'imprint', 'node_modules', '.next'
}

service_stay_root = {
    'wordpress-plugin-development',
    'woocommerce-custom-development',
    'learndash-customization-services',
    'api-integrations-services',
    'workflow-automation-services',
    'custom-websites-services',
    'wordpress-maintenance',
    'woocommerce-maintenance-services',
    'learndash-maintenance-services',
    'wordpress-site-maintenance-services',
    'hire-a-full-stack-wordpress-developer',
    'hire-expert-wordpress-plugin-developers',
    'custom-woocommerce-plugins-to-improve-online-stores',
    'ecommerce-website-development-services',
    'managed-wordpress-hosting',
    'on-page-seo',
    'wordpress-theme-development-services',
    'wordpress-plugins-for-small-business',
    'wordpress-seo',
    'wordpress-custom-plugin-development'
}

stay_at_root = core_stay_root.union(service_stay_root)

junk_to_delete = {d for d in dirs if d.endswith('-2') or d in [
    'edd-test-import', 'new-homepage', 'home', 'free-site', 'when-wordpress-was-founded', 
    'wordpress-org', 'an-introduction-to-sql-server-analysis-services-ssas',
    'how-to-check-traffic-on-websites', 'is-this-website-down', 'image-compression',
    'broken-link-checker', 'elementskit-content', 'comments', 'cdn-cgi'
]}

# 1. Remove Junk
deleted_count = 0
for j in junk_to_delete:
    if os.path.exists(j):
        shutil.rmtree(j)
        deleted_count += 1
print(f"Deleted {deleted_count} junk/duplicate folders.")

# 2. Ensure /blog directory exists
os.makedirs('blog', exist_ok=True)

# 3. Move blog post folders to /blog/
moved_count = 0
moved_slugs = []
dirs = [d for d in os.listdir('.') if os.path.isdir(d) and not d.startswith('.')]
for d in dirs:
    if d not in stay_at_root:
        target = os.path.join('blog', d)
        if not os.path.exists(target):
            shutil.move(d, target)
            moved_slugs.append(d)
            moved_count += 1

print(f"Moved {moved_count} blog folders into /blog/.")
