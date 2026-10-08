import glob
import re

consent_html = '''<div class="ar-sms-consent-box" style="margin: 16px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; line-height: 1.5; color: #1e293b; text-align: left; box-sizing: border-box; width: 100%;">
  <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-weight: normal; margin: 0; color: #1e293b; font-size: 13px;">
    <input type="checkbox" name="sms_consent" style="margin-top: 3px; width: 16px; height: 16px; accent-color: #BE8C33; flex-shrink: 0;" />
    <span>By submitting this form, you agree to receive marketing and promotional text messages from AR Webcrafts LLC at the number you provided. Consent is not a condition of purchase. Msg frequency varies. Msg and data rates may apply. Reply STOP to opt out, HELP for help. See our <a href="/privacy-policy/" target="_blank" style="color: #BE8C33; text-decoration: underline; font-weight: 600;">Privacy Policy</a> and <a href="/terms-and-conditions/" target="_blank" style="color: #BE8C33; text-decoration: underline; font-weight: 600;">Terms</a>.</span>
  </label>
</div>'''

files = glob.glob('**/*.html', recursive=True) + ['index.html']
files = list(set(files))

count = 0
for fpath in files:
    if 'node_modules' in fpath or '.next' in fpath:
        continue
    try:
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if '<form' not in content or 'ar-sms-consent-box' in content:
            continue

        # Insert consent_html right before submit button
        # Match <button type="submit" or <button ... type="submit" or <input type="submit"
        def add_consent(match):
            btn = match.group(0)
            return consent_html + '\n' + btn

        new_content = re.sub(r'(<(?:button|input)[^>]*type=[\"\']submit[\"\'][^>]*>)', add_consent, content, count=1, flags=re.IGNORECASE)
        if new_content == content:
            new_content = re.sub(r'(<button[^>]*class=[\"\'][^\"\']*ff-btn-submit[^\"\']*[\"\'][^>]*>)', add_consent, content, count=1, flags=re.IGNORECASE)

        if new_content != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
    except Exception as e:
        print(f"Error on {fpath}: {e}")

print(f"Added SMS consent disclaimer to contact forms in {count} HTML files.")
