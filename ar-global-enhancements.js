/**
 * AR WEBCRAFTS LLC — Global Enhancements & Mobile Interactive Features
 * 1. Robust Mobile Hamburger Menu Drawer (Open, Close, Nav, Backdrop, Esc)
 * 2. Calendly Full-Height Responsive Embedding & Auto-Height Resizing
 * 3. Header Nav Label Renames & White Label Partner Link Enhancement
 */

(function () {
  'use strict';

  if (window.__AR_GLOBAL_ENHANCEMENTS_INIT__) return;
  window.__AR_GLOBAL_ENHANCEMENTS_INIT__ = true;

  function initMobileMenu() {
    var hamburger = document.querySelector('.elementskit-menu-hamburger');
    var menuContainer = document.querySelector('.elementskit-menu-container');
    var overlay = document.querySelector('.elementskit-menu-overlay');

    if (!hamburger || !menuContainer) return;

    // Ensure overlay exists
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'elementskit-menu-overlay elementskit-menu-offcanvas-elements elementskit-menu-toggler ekit-nav-menu--overlay';
      menuContainer.parentNode.appendChild(overlay);
    }

    // Top Identity Panel inside drawer with Brand and Close (X) button
    var identityPanel = menuContainer.querySelector('.elementskit-nav-identity-panel');
    if (!identityPanel) {
      identityPanel = document.createElement('div');
      identityPanel.className = 'elementskit-nav-identity-panel';
      menuContainer.insertBefore(identityPanel, menuContainer.firstChild);
    } else if (menuContainer.firstChild !== identityPanel) {
      menuContainer.insertBefore(identityPanel, menuContainer.firstChild);
    }

    if (!identityPanel.querySelector('.ar-drawer-brand')) {
      var brand = document.createElement('div');
      brand.className = 'ar-drawer-brand';
      brand.innerHTML = '<span style="color:#BE8C33;font-size:18px;font-weight:900;">▲</span> <span>AR Webcrafts</span>';
      identityPanel.insertBefore(brand, identityPanel.firstChild);
    }

    var closeBtn = identityPanel.querySelector('.elementskit-menu-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'elementskit-menu-close elementskit-menu-toggler';
      closeBtn.type = 'button';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close menu');
      identityPanel.appendChild(closeBtn);
    } else {
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close menu');
    }

    // Free Consultation CTA at bottom of drawer
    if (!menuContainer.querySelector('.ar-drawer-cta-wrapper')) {
      var ctaWrap = document.createElement('div');
      ctaWrap.className = 'ar-drawer-cta-wrapper';
      ctaWrap.innerHTML = '<a href="https://calendly.com/arwebcrafts/30-mint" class="ar-drawer-cta-btn" target="_blank">Free Consultation</a>';
      menuContainer.appendChild(ctaWrap);
    }

    function openMenu(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      document.body.classList.add('ar-menu-open');
      menuContainer.classList.add('active');
      overlay.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      document.body.classList.remove('ar-menu-open');
      menuContainer.classList.remove('active');
      overlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      }
      if (menuContainer.classList.contains('active') || document.body.classList.contains('ar-menu-open')) {
        closeMenu(e);
      } else {
        openMenu(e);
      }
    }

    // Expose global methods
    window.openMobileDrawer = openMenu;
    window.closeMobileDrawer = closeMenu;
    window.toggleMobileDrawer = toggleMenu;

    hamburger.addEventListener('click', toggleMenu, true);
    closeBtn.addEventListener('click', closeMenu, true);
    overlay.addEventListener('click', closeMenu, true);

    // Close when clicking normal navigation links
    var links = menuContainer.querySelectorAll('.elementskit-navbar-nav a:not(.elementskit-dropdown-has > a)');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Services Submenu Toggle for Mobile
    var serviceItem = menuContainer.querySelector('.elementskit-dropdown-has');
    if (serviceItem) {
      var indicator = serviceItem.querySelector('.elementskit-submenu-indicator');
      var panel = serviceItem.querySelector('.elementskit-megamenu-panel');

      if (indicator && panel) {
        indicator.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          serviceItem.classList.toggle('open');
          panel.style.display = serviceItem.classList.contains('open') ? 'block' : 'none';
        });
      }
    }

    // Keyboard support: Escape closes menu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('ar-menu-open')) {
        closeMenu(e);
      }
    });
  }

  function initCalendly() {
    var widgets = document.querySelectorAll('.calendly-inline-widget');
    if (widgets.length === 0) return;

    function cleanupDuplicates() {
      widgets.forEach(function (widget) {
        widget.style.minWidth = '320px';
        widget.style.width = '100%';
        widget.style.minHeight = '750px';
        widget.style.display = 'block';
        widget.style.position = 'relative';

        var iframes = widget.querySelectorAll('iframe');
        if (iframes.length > 1) {
          for (var i = 0; i < iframes.length; i++) {
            if (!iframes[i].src.includes('embed_domain')) {
              iframes[i].remove();
            }
          }
        }
      });
    }

    cleanupDuplicates();
    setInterval(cleanupDuplicates, 500);

    // Dynamically adjust height if Calendly sends postMessage
    window.addEventListener('message', function (e) {
      if (e.data && e.data.event === 'calendly.page_height' && e.data.payload && e.data.payload.height) {
        widgets.forEach(function (w) {
          var h = Math.max(750, parseInt(e.data.payload.height, 10));
          w.style.height = h + 'px';
          var ifr = w.querySelector('iframe');
          if (ifr) ifr.style.height = h + 'px';
        });
      }
    });

    // Ensure official Calendly script is present
    if (!document.querySelector('script[src*="calendly.com/assets/external/widget.js"]')) {
      var script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  function initFormHandling() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      // Exclude forms that manage their own checkout or demo submissions
      if (
        form.id === 'ar-checkout-form' ||
        form.id === 'demoForm' ||
        form.dataset.customSubmit === 'true' ||
        form.dataset.arHandled === 'true'
      ) {
        return;
      }

      form.dataset.arHandled = 'true';

      // Inject hidden anti-spam honeypot & timestamp if not already present
      if (!form.querySelector('input[name="hp_website_check"]')) {
        var hpWrap = document.createElement('div');
        hpWrap.style.cssText = 'display:none!important;position:absolute;left:-9999px;opacity:0;';
        hpWrap.setAttribute('aria-hidden', 'true');
        hpWrap.innerHTML = '<input type="text" name="hp_website_check" tabindex="-1" autocomplete="off"><input type="hidden" name="form_loaded_at" value="' + Date.now() + '">';
        form.appendChild(hpWrap);
      }

      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 1. Validate A2P 10DLC SMS Consent Checkbox if present in form
        var consentBox = form.querySelector('input[name="sms_consent"]');
        if (consentBox && !consentBox.checked) {
          var consentContainer = consentBox.closest('.ar-sms-consent-box') || consentBox.parentElement;
          if (consentContainer) {
            consentContainer.style.outline = '2px solid #BE8C33';
            consentContainer.style.outlineOffset = '2px';
            consentContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          consentBox.focus();
          return;
        } else if (consentBox) {
          var consentContainer = consentBox.closest('.ar-sms-consent-box') || consentBox.parentElement;
          if (consentContainer) consentContainer.style.outline = '';
        }

        // 2. Check honeypot field
        var hp = form.querySelector('input[name="hp_website_check"]');
        if (hp && hp.value.trim()) {
          // Bot detected: silent success drop
          showSuccess();
          return;
        }

        var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button');
        var origText = submitBtn ? submitBtn.innerText : 'Submit';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Sending...';
        }

        // 3. Serialize and post to secure /api/contact/
        var formData = new FormData(form);
        var payload = { page_url: window.location.pathname };
        formData.forEach(function (v, k) { payload[k] = v; });

        try {
          await fetch('/api/contact/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.warn('[Contact Form] Notice:', err.message);
        }

        function showSuccess() {
          var successMsg = document.createElement('div');
          successMsg.className = 'ar-form-success-msg';
          successMsg.style.cssText = 'background:#10b981;color:#fff;padding:16px 20px;border-radius:12px;font-weight:700;font-size:15px;margin-top:15px;text-align:center;box-shadow:0 10px 25px rgba(16,185,129,0.25);';
          successMsg.innerHTML = '✓ Thank you! Your request has been received. Our team will contact you within 2 hours.';

          form.style.display = 'none';
          if (form.parentNode) {
            form.parentNode.appendChild(successMsg);
          }
        }

        setTimeout(showSuccess, 400);
      });
    });
  }

  function initWhatsAppButton() {
    if (document.querySelector('.ar-whatsapp-floating-btn')) return;
    var btn = document.createElement('a');
    btn.className = 'ar-whatsapp-floating-btn';
    btn.href = 'https://wa.me/13072784862?text=' + encodeURIComponent('Hi AR Webcrafts, I want to claim the Q4 Special Offer / discuss a website project.');
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat with AR Webcrafts on WhatsApp');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#ffffff" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.22 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z"/></svg><span>Chat on WhatsApp</span><div class="ar-wa-pulse"></div>';
    document.body.appendChild(btn);
  }

  /**
   * 5. Nav Label Renames & Enhancements
   * - "About Us" → "About", "Contact Us" → "Contact"
   * - Dynamically insert "Agency Partner" link if not already present
   * - Mark "Hire Us" and "Agency Partner" items with appropriate classes
   */
  function initNavEnhancements() {
    var ul = document.querySelector('.elementskit-navbar-nav');
    if (!ul) return;

    var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    var isPartnerPage = /white-label|partner/i.test(currentPath);

    // Ensure Agency Partner item exists in nav
    var existingPartner = ul.querySelector('a[href*="white-label"], a[href*="partner"], .ar-nav-partner-item');
    if (!existingPartner) {
      // Find Hire Us item (usually last) to insert right before it
      var hireLi = null;
      var items = ul.querySelectorAll(':scope > li');
      for (var i = items.length - 1; i >= 0; i--) {
        if (/hire\s+us/i.test(items[i].textContent || '')) {
          hireLi = items[i];
          break;
        }
      }
      var newLi = document.createElement('li');
      newLi.className = 'menu-item menu-item-type-post_type menu-item-object-page nav-item ar-nav-partner-item' + (isPartnerPage ? ' current-menu-item active' : '');
      newLi.innerHTML = '<a href="/white-label-development-partner/" class="ekit-menu-nav-link"' + (isPartnerPage ? ' aria-current="page"' : '') + '>Agency Partner</a>';
      if (hireLi) {
        ul.insertBefore(newLi, hireLi);
      } else {
        ul.appendChild(newLi);
      }
    }

    var navItems = ul.querySelectorAll(':scope > li > a.ekit-menu-nav-link');
    navItems.forEach(function(link) {
      var text = link.textContent || link.innerText || '';
      var trimmed = text.trim();
      var li = link.parentElement;

      // Rename "About Us" → "About"
      if (/^about\s+us$/i.test(trimmed)) {
        var textNode = findTextNode(link, trimmed);
        if (textNode) textNode.textContent = 'About';
        li.classList.add('ar-nav-renamed');
      }

      // Rename "Contact Us" → "Contact"
      if (/^contact\s+us$/i.test(trimmed)) {
        var textNode = findTextNode(link, trimmed);
        if (textNode) textNode.textContent = 'Contact';
        li.classList.add('ar-nav-renamed');
      }

      // Mark "Hire Us" button-style
      if (/^hire\s+us$/i.test(trimmed)) {
        li.classList.add('ar-nav-hire-btn');
      }

      // Mark "Work With Us" / White Label partner item in gold
      if (/work\s+with\s+us|white\s+label|agency\s+partner/i.test(trimmed)) {
        li.classList.add('ar-nav-partner-item');
        if (isPartnerPage) {
          li.classList.add('current-menu-item', 'active');
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  /** Find a text node within an element matching given text */
  function findTextNode(el, text) {
    var nodes = el.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.trim() === text.trim()) {
        return nodes[i];
      }
    }
    // Fallback: return first text node found
    for (var j = 0; j < nodes.length; j++) {
      if (nodes[j].nodeType === Node.TEXT_NODE && nodes[j].textContent.trim().length > 0) {
        return nodes[j];
      }
    }
    return null;
  }

  function init() {
    initMobileMenu();
    initCalendly();
    initFormHandling();
    initWhatsAppButton();
    initNavEnhancements();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
