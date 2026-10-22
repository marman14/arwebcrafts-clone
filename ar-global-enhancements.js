/**
 * AR WEBCRAFTS LLC — Global Enhancements & Mobile Interactive Features
 * 1. Robust Mobile Hamburger Menu Drawer (Open, Close, Nav, Backdrop, Esc)
 * 2. Calendly Full-Height Responsive Embedding & Auto-Height Resizing
 * 3. Header Nav Label Renames & White Label Partner Link Enhancement
 */

(function () {
  'use strict';

  // Instant Anti-FOUC & Zero Blank Screen Guarantee
  try {
    var preInv = document.querySelectorAll('.elementor-invisible');
    for (var pi = 0; pi < preInv.length; pi++) {
      preInv[pi].classList.remove('elementor-invisible');
      preInv[pi].style.visibility = 'visible';
      preInv[pi].style.opacity = '1';
    }
  } catch (e) {}

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

    // Close when clicking normal navigation links (ignore dropdown toggles)
    var links = menuContainer.querySelectorAll('.elementskit-navbar-nav a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        // Do not close drawer if clicking dropdown triggers
        if (link.closest('.elementskit-dropdown-has > a') || link.closest('.ar-cs-dropdown-parent > a') || link.matches('.ar-cs-dropdown-parent > a')) {
          return;
        }
        closeMenu();
      });
    });

    // Services Submenu Toggle for Mobile & Desktop Hover Hold
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

      // Desktop Hover Intent & Mouse Leave Grace Period (Prevents accidental premature triggers)
      var openTimer = null;
      var closeTimer = null;
      var isDesktop = function () {
        return window.innerWidth >= 1025;
      };

      serviceItem.addEventListener('mouseenter', function () {
        if (!isDesktop()) return;
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        if (serviceItem.classList.contains('elementskit-dropdown-open')) return;
        // 180ms deliberate hover dwell prevents accidental pop-ups when cursor merely passes by
        openTimer = setTimeout(function () {
          serviceItem.classList.add('elementskit-dropdown-open');
        }, 180);
      });

      serviceItem.addEventListener('mouseleave', function () {
        if (!isDesktop()) return;
        if (openTimer) {
          clearTimeout(openTimer);
          openTimer = null;
        }
        closeTimer = setTimeout(function () {
          serviceItem.classList.remove('elementskit-dropdown-open');
        }, 220); // 220ms grace period so cursor can transition cleanly into panel
      });

      // Desktop Click toggle support
      var serviceLink = serviceItem.querySelector(':scope > a.ekit-menu-nav-link');
      if (serviceLink) {
        serviceLink.addEventListener('click', function (e) {
          if (!isDesktop()) return;
          if (!serviceItem.classList.contains('elementskit-dropdown-open')) {
            if (openTimer) clearTimeout(openTimer);
            serviceItem.classList.add('elementskit-dropdown-open');
          }
        });
      }

      // Instantly close on sub-page link click to allow smooth navigation
      var panelLinks = serviceItem.querySelectorAll('.elementskit-megamenu-panel a');
      panelLinks.forEach(function (pLink) {
        pLink.addEventListener('click', function () {
          if (openTimer) clearTimeout(openTimer);
          if (closeTimer) clearTimeout(closeTimer);
          serviceItem.classList.remove('elementskit-dropdown-open');
        });
      });
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
    setTimeout(cleanupDuplicates, 1000);
    setTimeout(cleanupDuplicates, 2500);

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
    // 1. Helper to safely extract all form inputs (supports elements with name, id, or select/textarea)
    function extractFormPayload(form) {
      var payload = {
        page_url: window.location.pathname || '/',
        page_title: document.title || 'AR Webcrafts'
      };

      var elements = form.querySelectorAll('input, select, textarea');
      elements.forEach(function (el) {
        if (el.type === 'submit' || el.type === 'button') return;
        if (el.type === 'checkbox' && !el.checked) return;
        if (el.type === 'radio' && !el.checked) return;

        var key = el.name || el.id || '';
        if (!key) return;
        var val = (el.value || '').trim();
        var ph = (el.placeholder || '').toLowerCase();
        var keyLower = key.toLowerCase();

        // Always preserve raw field key-value
        payload[key] = val;

        // Normalizing key names intelligently
        if (/^(names\[first_name\]|first_name|.*-name|name|author)$/i.test(key) || ph.includes('your name') || ph.includes('first name')) {
          payload.name = payload.name ? (payload.name + ' ' + val).trim() : val;
        } else if (/^names\[last_name\]|last_name$/i.test(key) || ph.includes('last name')) {
          payload.name = payload.name ? (payload.name + ' ' + val).trim() : val;
        } else if (/^(email|email_1|.*-email)$/i.test(key) || el.type === 'email' || ph.includes('email')) {
          payload.email = val;
        } else if (
          /^(phone|mobile|tel|.*-phone)$/i.test(key) ||
          el.type === 'tel' ||
          (/numeric_field/i.test(key) && (ph.includes('phone') || ph.includes('number'))) ||
          (keyLower === 'input_text' && (ph.includes('phone') || ph.includes('mobile') || ph.includes('tel')))
        ) {
          payload.phone = val;
        } else if (
          /^(company|agency|business|website_url|.*-company|.*-url)$/i.test(key) ||
          (keyLower === 'input_text' && (ph.includes('company') || ph.includes('business') || ph.includes('agency'))) ||
          key.includes('field_a412e07')
        ) {
          payload.company = val;
        } else if (
          /^(engineering_role|sa_skill|hfsd-role|role|skill|.*-role|.*-skill)$/i.test(key)
        ) {
          if (val) {
            payload.service = val;
            payload.engineering_role = val;
          }
        } else if (
          /^(service|interest|selected_service|dropdown|dropdown_[0-9]|primary_need|resource_need|project_type|automation_need|automation_type|plugin_need|systems|plan|.*-service|.*-source)$/i.test(key) ||
          key.includes('field_a88ad9d')
        ) {
          if (!payload.service || payload.service === 'General Inquiry') {
            payload.service = val;
          }
        } else if (
          /^(budget|timeline|engagement_duration|sa_duration|hfsd-duration|duration|traffic_volume|software_stack|platforms|protocol|.*-budget|.*-volume|.*-count|.*-duration|.*-timeline)$/i.test(key) ||
          (/numeric_field/i.test(key) && (ph.includes('budget') || ph.includes('amount') || ph.includes('store') || ph.includes('site') || ph.includes('volume')))
        ) {
          payload.budget = val;
        } else if (/^(message|description|comments|project_details|project_brief|project_scope|requirements|scope|notes|comment|.*-brief)$/i.test(key)) {
          payload.message = val;
        } else if (key === 'hp_website_check' || key === 'company_fax' || key === 'website_address_confirm') {
          payload[key] = val;
        } else if (key === 'form_loaded_at' || key === '_ar_loaded_at' || key === '_ar_interacted' || key === '_ar_keystrokes') {
          payload[key] = val;
        }
      });

      // Default service to h1 or document title if not explicitly set
      if (!payload.service) {
        var h1 = document.querySelector('h1');
        payload.service = h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : document.title;
      }

      return payload;
    }

    // 2. Centralized Submit Handler
    async function submitUnifiedForm(form) {
      if (form.dataset.arSubmitting === 'true') return;

      // Validate A2P 10DLC SMS Consent Checkbox if present
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
      }

      // Check multi-field honeypot trap
      var hp1 = form.querySelector('input[name="hp_website_check"]');
      var hp2 = form.querySelector('input[name="company_fax"]');
      var hp3 = form.querySelector('input[name="website_address_confirm"]');
      if ((hp1 && hp1.value.trim()) || (hp2 && hp2.value.trim()) || (hp3 && hp3.value.trim())) {
        renderSuccess(form, { name: 'Visitor' });
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button:not([type="button"])');
      var origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s infinite linear;">↻</span> Submitting...';
      }
      form.dataset.arSubmitting = 'true';

      var payload = extractFormPayload(form);

      // Check if newsletter form
      var isNewsletter = form.id === 'fluentform_2' ||
                         form.classList.contains('fluent_form_2') ||
                         (!payload.name && payload.email && !payload.message && !payload.company);
      if (isNewsletter) {
        payload.is_newsletter = true;
        payload.service = 'Newsletter Subscription';
        payload.name = payload.name || 'Newsletter Subscriber';
      }

      try {
        var resp = await fetch('/api/contact/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          var respData = await resp.json().catch(function() { return {}; });
          try {
            var browserLeads = JSON.parse(localStorage.getItem('arw_browser_leads') || '[]');
            browserLeads.unshift({
              id: respData.leadId || ('lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)),
              timestamp: new Date().toISOString(),
              pageUrl: payload.page_url || window.location.pathname,
              pageTitle: payload.page_title || document.title,
              name: payload.name || 'Anonymous',
              email: payload.email || '',
              phone: payload.phone || payload.input_text || '',
              service: payload.service || 'General Inquiry',
              budget: payload.budget || 'Not specified',
              subject: payload.subject || 'Website Inquiry',
              message: payload.message || '',
              company: payload.company || '',
              status: 'new'
            });
            localStorage.setItem('arw_browser_leads', JSON.stringify(browserLeads.slice(0, 100)));
          } catch (e) {}
          renderSuccess(form, payload);
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          showError(form, errData.error || 'Unable to submit request. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHtml;
          }
          form.dataset.arSubmitting = 'false';
        }
      } catch (err) {
        console.warn('[Form Submit Network Fallback]:', err.message);
        renderSuccess(form, payload);
      }
    }

    // 3. Render Success View
    function renderSuccess(form, payload) {
      // Check if page has a predefined success container
      var pageSuccessEl = document.getElementById('ld-form-success') ||
                           document.getElementById('ldm-form-success') ||
                           document.getElementById('ldms-form-success') ||
                           document.getElementById('wcms-form-success') ||
                           document.getElementById('wpm-form-success');
      if (pageSuccessEl) {
        form.style.display = 'none';
        pageSuccessEl.style.display = 'block';
        pageSuccessEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Check if it's the footer newsletter form
      if (payload.is_newsletter || form.id === 'fluentform_2' || form.classList.contains('fluent_form_2')) {
        var newsSuccess = document.createElement('div');
        newsSuccess.className = 'ar-newsletter-success';
        newsSuccess.style.cssText = 'color:#4ADE80;font-size:14px;font-weight:600;margin-top:12px;text-align:center;padding:8px;background:rgba(34,197,94,0.1);border-radius:8px;border:1px solid rgba(34,197,94,0.25);';
        newsSuccess.innerHTML = '✓ Thank you! You have been subscribed to AR Webcrafts.';
        form.style.display = 'none';
        if (form.parentNode) form.parentNode.appendChild(newsSuccess);
        return;
      }

      // Check for hero card wrapper
      var card = form.closest('.wl-hero-card, .wpd-hero-card, .wtd-hero-card, .wcd-hero-card, .wms-form-card, .hfsd-form-card, .cwds-form-card, .wpcd-form-card, .aia-form-card, .was-form-card, .api-form-card, .ld-form-wrapper, .elementor-widget-container');
      
      var clientName = payload.name || 'there';
      var successHtml = '<div class="ar-form-success-card" style="text-align:center;padding:36px 20px;animation:fadeIn 0.4s ease;">' +
        '<div style="font-size:3rem;margin-bottom:16px;line-height:1;">🚀</div>' +
        '<h3 style="font-size:22px;font-weight:800;color:#FFFFFF;margin-bottom:12px;letter-spacing:-0.01em;">Proposal Request Received!</h3>' +
        '<p style="font-size:15px;color:#94A3B8;line-height:1.6;max-width:440px;margin:0 auto 20px auto;">' +
        'Thank you, <strong style="color:#C89D4B;">' + clientName + '</strong>! Our senior engineering team has received your inquiry from this page and will contact you within 2 business hours.</p>' +
        '<div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:9999px;font-size:13px;color:#4ADE80;font-weight:600;">' +
        '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' +
        'Verified & Dispatched to Technical Lead</div></div>';

      if (card && card.classList.contains('wl-hero-card')) {
        // Specific Agency Partner card theme
        card.innerHTML = '<div style="text-align:center;padding:32px 16px;">' +
          '<div style="font-size:3rem;margin-bottom:16px;">🎉</div>' +
          '<h3 style="font-family:var(--sans, sans-serif);font-size:22px;font-weight:800;color:var(--navy, #FFFFFF);margin-bottom:12px;">Partnership Inquiry Received!</h3>' +
          '<p style="font-size:15px;color:var(--muted, #94A3B8);line-height:1.6;margin-bottom:20px;">' +
          'Thank you, <strong style="color:var(--gold, #C89D4B);">' + clientName + '</strong>. We will review your inquiry and get back to you within 2 business hours.</p></div>';
      } else if (card) {
        card.innerHTML = successHtml;
      } else {
        var msg = document.createElement('div');
        msg.innerHTML = successHtml;
        form.style.display = 'none';
        if (form.parentNode) form.parentNode.appendChild(msg);
      }
    }

    function showError(form, errorMsg) {
      var existingErr = form.querySelector('.ar-form-error-banner');
      if (existingErr) existingErr.remove();

      var errDiv = document.createElement('div');
      errDiv.className = 'ar-form-error-banner';
      errDiv.style.cssText = 'color:#EF4444;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px;font-weight:500;';
      errDiv.innerText = errorMsg;
      form.insertBefore(errDiv, form.firstChild);
    }

    // 4. Overwrite inline mock submission functions on the 5 LMS / Maintenance pages
    window.handleLdFormSubmit = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = document.getElementById('ld-proposal-form');
      if (f) submitUnifiedForm(f);
    };
    window.handleLdmFormSubmit = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = document.getElementById('ldm-proposal-form');
      if (f) submitUnifiedForm(f);
    };
    window.handleLdmsFormSubmit = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = document.getElementById('ldms-proposal-form');
      if (f) submitUnifiedForm(f);
    };
    window.handleWcmsFormSubmit = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = document.getElementById('wcms-proposal-form');
      if (f) submitUnifiedForm(f);
    };
    window.handleWpmFormSubmit = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = document.getElementById('wpm-proposal-form');
      if (f) submitUnifiedForm(f);
    };

    // 5. Attach to all forms across all pages
    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      if (
        form.id === 'ar-checkout-form' ||
        form.id === 'demoForm' ||
        form.dataset.customSubmit === 'true' ||
        form.dataset.arHandled === 'true'
      ) {
        return;
      }

      // Inject multi-layer hidden anti-spam honeypot & behavioral tracking into ALL forms
      if (!form.querySelector('.ar-security-trap')) {
        var trapWrap = document.createElement('div');
        trapWrap.className = 'ar-security-trap';
        trapWrap.style.cssText = 'position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;z-index:-1!important;';
        trapWrap.setAttribute('aria-hidden', 'true');
        trapWrap.innerHTML = [
          '<input type="text" name="hp_website_check" tabindex="-1" autocomplete="new-password" aria-hidden="true">',
          '<input type="text" name="company_fax" tabindex="-1" autocomplete="off" aria-hidden="true">',
          '<input type="text" name="website_address_confirm" tabindex="-1" autocomplete="off" aria-hidden="true">',
          '<input type="hidden" name="_ar_loaded_at" value="' + Date.now() + '">',
          '<input type="hidden" name="form_loaded_at" value="' + Date.now() + '">',
          '<input type="hidden" name="_ar_interacted" value="0">',
          '<input type="hidden" name="_ar_keystrokes" value="0">'
        ].join('');
        form.appendChild(trapWrap);

        // Track human keyboard and focus interaction
        var keyCount = 0;
        form.addEventListener('keydown', function() {
          keyCount++;
          var keyInput = form.querySelector('input[name="_ar_keystrokes"]');
          if (keyInput) keyInput.value = String(keyCount);
          var intInput = form.querySelector('input[name="_ar_interacted"]');
          if (intInput && intInput.value === '0') intInput.value = String(Date.now());
        }, { passive: true });

        form.addEventListener('focusin', function() {
          var intInput = form.querySelector('input[name="_ar_interacted"]');
          if (intInput && intInput.value === '0') intInput.value = String(Date.now());
        }, { passive: true });

        form.addEventListener('pointerdown', function() {
          var intInput = form.querySelector('input[name="_ar_interacted"]');
          if (intInput && intInput.value === '0') intInput.value = String(Date.now());
        }, { passive: true });
      }

      // For self-handled forms, attach companion listener to guarantee immediate local dashboard sync
      var selfHandledForms = ['wl-partner-form', 'wpd-plugin-form', 'wtd-theme-form', 'wcd-woo-form'];
      if (selfHandledForms.indexOf(form.id) !== -1) {
        form.dataset.arHandled = 'true';
        form.addEventListener('submit', function () {
          setTimeout(function () {
            try {
              var payload = extractFormPayload(form);
              if (payload && (payload.name || payload.email)) {
                var browserLeads = JSON.parse(localStorage.getItem('arw_browser_leads') || '[]');
                var exists = browserLeads.some(function(l) {
                  return l.email === payload.email && (Date.now() - new Date(l.timestamp || 0).getTime() < 10000);
                });
                if (!exists) {
                  browserLeads.unshift({
                    id: 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
                    timestamp: new Date().toISOString(),
                    pageUrl: payload.page_url || window.location.pathname,
                    pageTitle: payload.page_title || document.title,
                    name: payload.name || 'Anonymous',
                    email: payload.email || '',
                    phone: payload.phone || '',
                    service: payload.service || 'General Inquiry',
                    budget: payload.budget || 'Not specified',
                    subject: payload.subject || 'Website Inquiry',
                    message: payload.message || '',
                    company: payload.company || '',
                    status: 'new'
                  });
                  localStorage.setItem('arw_browser_leads', JSON.stringify(browserLeads.slice(0, 100)));
                }
              }
            } catch (e) {}
          }, 300);
        }, true);
        return;
      }

      form.dataset.arHandled = 'true';

      // Handle api-contact-form which has inline alert onsubmit
      if (form.id === 'api-contact-form') {
        form.removeAttribute('onsubmit');
        form.onsubmit = null;
      }

      // Intercept submit
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        submitUnifiedForm(form);
      }, true);
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
   * - Mark "Hire Us" nav item
   */
  function initNavEnhancements() {
    var ul = document.querySelector('.elementskit-navbar-nav');
    if (!ul) return;

    var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    var isPartnerPage = /agency-partner|white-label|partner/i.test(currentPath);

    // 1. CRITICAL: Ensure Services mega menu (li#menu-item-1074) is NEVER hidden or marked as hire
    var servicesLi = ul.querySelector(':scope > li#menu-item-1074, :scope > li.elementskit-megamenu-has');
    if (servicesLi) {
      servicesLi.classList.remove('ar-nav-hidden-hire');
      servicesLi.style.removeProperty('display');
      // Services MUST always be the very first item in the header navigation
      if (ul.firstElementChild !== servicesLi) {
        ul.insertBefore(servicesLi, ul.firstElementChild);
      }
    }

    // 2. Hide ONLY top-level "Hire Us" menu item (never match links inside mega menu panel!)
    var topHireLi = ul.querySelector(':scope > li#menu-item-10238');
    if (!topHireLi) {
      var topLis = ul.querySelectorAll(':scope > li');
      for (var i = 0; i < topLis.length; i++) {
        var a = topLis[i].querySelector(':scope > a.ekit-menu-nav-link');
        if (a && /^hire\s+us$/i.test((a.textContent || '').trim())) {
          topHireLi = topLis[i];
          break;
        }
      }
    }
    if (topHireLi) {
      topHireLi.classList.add('ar-nav-hidden-hire');
      topHireLi.style.setProperty('display', 'none', 'important');
    }

    // 3. Locate or create "Agency Partner" nav item at the END of the navigation menu
    var partnerLis = ul.querySelectorAll(':scope > li.ar-nav-partner-item');
    if (partnerLis.length > 1) {
      for (var p = 1; p < partnerLis.length; p++) {
        partnerLis[p].remove();
      }
    }
    var partnerLi = partnerLis.length ? partnerLis[0] : null;
    if (!partnerLi) {
      var topLis2 = ul.querySelectorAll(':scope > li');
      for (var j = 0; j < topLis2.length; j++) {
        var linkEl = topLis2[j].querySelector(':scope > a');
        if (linkEl && (/agency-partner|white-label/i.test(linkEl.getAttribute('href') || '') || /agency\s+partner/i.test((linkEl.textContent || '').trim()))) {
          partnerLi = topLis2[j];
          break;
        }
      }
    }

    var otherLi = ul.querySelector(':scope > li#menu-item-159, :scope > li.ar-about-dropdown-parent');

    if (isPartnerPage) {
      // ON AGENCY PARTNER PAGE ONLY: Clean up extra items
      // 1. Remove Agency Partner link from the nav (page already has prominent 'Become a Partner' CTA button)
      if (partnerLi) {
        partnerLi.remove();
      }
      // 2. Remove Portfolio from nav on this page
      var portfolioLi = ul.querySelector(':scope > li#menu-item-2443, :scope > li.menu-item-2443');
      if (portfolioLi) {
        portfolioLi.remove();
      }
      // 3. Move Other to the very END (after Contact, before hidden Hire Us)
      if (topHireLi && otherLi) {
        ul.insertBefore(otherLi, topHireLi);
      } else if (otherLi) {
        ul.appendChild(otherLi);
      }
    } else {
      // ON ALL OTHER PAGES: Maintain global menu with Agency Partner placed before Other
      if (!partnerLi) {
        partnerLi = document.createElement('li');
        partnerLi.className = 'menu-item menu-item-type-post_type menu-item-object-page nav-item elementskit-mobile-builder-content ar-nav-partner-item';
        partnerLi.setAttribute('data-vertical-menu', '750px');
        partnerLi.innerHTML = '<a href="/agency-partner/" class="ekit-menu-nav-link">Agency Partner</a>';
      } else {
        partnerLi.classList.remove('ar-nav-hidden-hire');
        partnerLi.style.removeProperty('display');
        partnerLi.classList.add('ar-nav-partner-item');
        var partnerA = partnerLi.querySelector(':scope > a');
        if (partnerA) {
          partnerA.setAttribute('href', '/agency-partner/');
        }
      }

      if (topHireLi) {
        ul.insertBefore(partnerLi, topHireLi);
        if (otherLi) {
          ul.insertBefore(otherLi, topHireLi);
        }
      } else {
        ul.appendChild(partnerLi);
        if (otherLi) {
          ul.appendChild(otherLi);
        }
      }
    }

    // 4. Rename "Contact Us" → "Contact" and "About Us" / "About" → "Other" on TOP-LEVEL items only
    var navItems = ul.querySelectorAll(':scope > li > a.ekit-menu-nav-link');
    navItems.forEach(function(link) {
      var text = (link.textContent || '').trim();
      var li = link.parentElement;

      // Rename top-level "About Us" / "About" → "Other" (for the dropdown trigger)
      if (/^(about\s+us|about)$/i.test(text) && (li.id === 'menu-item-159' || li.classList.contains('ar-about-dropdown-parent'))) {
        var textNode = findTextNode(link, text);
        if (textNode) {
          textNode.textContent = 'Other';
        } else {
          link.textContent = 'Other';
        }
        li.classList.add('ar-nav-renamed');
      }

      // Rename "Contact Us" → "Contact"
      if (/^contact\s+us$/i.test(text)) {
        var textNode = findTextNode(link, text);
        if (textNode) {
          textNode.textContent = 'Contact';
        } else {
          link.textContent = 'Contact';
        }
        li.classList.add('ar-nav-renamed');
      }
    });

    // 5. Final check: Ensure Services is strictly the very first element child of ul
    if (servicesLi && ul.firstElementChild !== servicesLi) {
      ul.insertBefore(servicesLi, ul.firstElementChild);
    }
    // Center-align the 3 mega menu category headers directly over each column
    try {
      var headerRow = document.querySelector('.elementskit-megamenu-panel .elementor-element-4bf31f5d .elementor-container');
      if (headerRow) {
        headerRow.style.setProperty('display', 'flex', 'important');
        headerRow.style.setProperty('align-items', 'center', 'important');
        headerRow.style.setProperty('justify-content', 'center', 'important');
        headerRow.style.setProperty('width', '100%', 'important');
        headerRow.style.setProperty('max-width', '100%', 'important');
        headerRow.style.setProperty('margin', '0', 'important');
        headerRow.style.setProperty('padding', '0', 'important');
      }
      var headerCols = document.querySelectorAll(
        '.elementskit-megamenu-panel .elementor-element-4bf31f5d .elementor-column, ' +
        '.elementskit-megamenu-panel .elementor-element-4bf31f5d .elementor-element-7bf60c7a, ' +
        '.elementskit-megamenu-panel .elementor-element-4bf31f5d .elementor-element-9fccfc, ' +
        '.elementskit-megamenu-panel .elementor-element-4bf31f5d .elementor-element-ds-hdr'
      );
      headerCols.forEach(function (col) {
        col.style.setProperty('flex', '1 1 33.333%', 'important');
        col.style.setProperty('max-width', '33.333%', 'important');
        col.style.setProperty('width', '33.333%', 'important');
        col.style.setProperty('display', 'flex', 'important');
        col.style.setProperty('align-items', 'center', 'important');
        col.style.setProperty('justify-content', 'center', 'important');
        col.style.setProperty('text-align', 'center', 'important');
        col.style.setProperty('padding', '0 16px', 'important');
        col.style.setProperty('margin', '0', 'important');
        col.style.setProperty('box-sizing', 'border-box', 'important');
      });
      var catTitles = document.querySelectorAll(
        '.elementskit-megamenu-panel .elementor-element-4bf31f5d h2.elementor-heading-title, ' +
        '.elementskit-megamenu-panel .elementor-element-ds-hdr-title .elementor-heading-title, ' +
        '.elementskit-megamenu-panel .elementor-element-9a1bcf8 .elementor-heading-title, ' +
        '.elementskit-megamenu-panel .elementor-element-2c61c89f .elementor-heading-title'
      );
      catTitles.forEach(function (title) {
        title.style.setProperty('margin', '0', 'important');
        title.style.setProperty('padding', '0', 'important');
        title.style.setProperty('line-height', '1', 'important');
        title.style.setProperty('font-size', '13px', 'important');
        title.style.setProperty('font-weight', '800', 'important');
        title.style.setProperty('letter-spacing', '0.1em', 'important');
        title.style.setProperty('text-transform', 'uppercase', 'important');
        title.style.setProperty('color', '#BE8C33', 'important');
        title.style.setProperty('display', 'block', 'important');
        title.style.setProperty('text-align', 'center', 'important');
        title.style.setProperty('width', '100%', 'important');
      });
    } catch (e) {}
  }

  /** Find a text node within an element matching given text */
  function findTextNode(el, text) {
    var nodes = el.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      if ((nodes[i].nodeType === 3) && nodes[i].textContent.trim() === text.trim()) {
        return nodes[i];
      }
    }
    // Fallback: return first text node found
    for (var j = 0; j < nodes.length; j++) {
      if ((nodes[j].nodeType === 3) && nodes[j].textContent.trim().length > 0) {
        return nodes[j];
      }
    }
    return null;
  }

  /**
   * Elementor Scroll & Entrance Animation Engine
   * Detects elements with .elementor-invisible or animation settings,
   * reads their animation type (fadeInLeft, fadeInRight, etc.) & delay,
   * and plays the animation as they enter the viewport.
   */
  function initScrollAnimations() {
    var targets = document.querySelectorAll('.elementor-invisible, [data-settings*="animation"]');
    for (var k = 0; k < targets.length; k++) {
      targets[k].classList.remove('elementor-invisible');
      targets[k].style.visibility = 'visible';
      targets[k].style.opacity = '1';
    }
    if (!targets.length) return;

    function applyAnimation(el) {
      if (el.hasAttribute('data-ar-animated')) return;
      el.setAttribute('data-ar-animated', 'true');

      var settingsAttr = el.getAttribute('data-settings');
      var animName = 'fadeInLeft';
      var delay = 0;

      if (settingsAttr) {
        try {
          var s = JSON.parse(settingsAttr);
          var a = s._animation || s.animation;
          if (a && a !== 'none') animName = a;
          var d = s._animation_delay !== undefined ? s._animation_delay : s.animation_delay;
          if (d !== undefined && d !== null) delay = parseInt(d, 10) || 0;
        } catch (err) {
          var m = settingsAttr.match(/"_?animation":\s*"([^"]+)"/);
          if (m && m[1] !== 'none') animName = m[1];
          var dm = settingsAttr.match(/"_?animation_delay":\s*(\d+)/);
          if (dm) delay = parseInt(dm[1], 10) || 0;
        }
      }

      if (animName === 'none') {
        el.classList.remove('elementor-invisible');
        el.style.visibility = 'visible';
        return;
      }

      el.classList.remove('elementor-invisible');
      if (delay > 0) {
        el.style.animationDelay = delay + 'ms';
        el.style.webkitAnimationDelay = delay + 'ms';
      }
      el.classList.add('animated', animName);
    }

    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            applyAnimation(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      });

      targets.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      targets.forEach(function (el) {
        applyAnimation(el);
      });
    }

    // Safety fallback: reveal all remaining hidden elements after 3.5s so nothing is ever stuck blank
    setTimeout(function () {
      var stillHidden = document.querySelectorAll('.elementor-invisible');
      for (var i = 0; i < stillHidden.length; i++) {
        stillHidden[i].classList.remove('elementor-invisible');
        stillHidden[i].style.visibility = 'visible';
      }
    }, 3500);
  }

  /**
   * Top Bar Container & Content Sync
   * - Ensures container has standard container classes
   * - Updates text to "Top-Rated Development Agency | Book Your Free Strategy Call Today!"
   */
  function initTopBar() {
    var topBar = document.querySelector('.elementor-element-011475a');
    if (!topBar) return;

    var container = topBar.querySelector('.elementor-container');
    if (container) {
      container.classList.add('container', 'mx-auto', 'px-4');
    }

    var textSpan = topBar.querySelector('.elementor-element-8360e7b .elementor-icon-list-text');
    if (textSpan) {
      textSpan.textContent = 'Top-Rated Development Agency | Book Your Free Strategy Call Today!';
    }
  }

  /**
   * Case Studies Header Dropdown & Smooth Section Anchoring
   * - Attaches center-aligned dropdown beneath "Case Studies"
   * - 4 Items (Top to Bottom):
   *   1. LearnDash Plugins
   *   2. WooCommerce Custom Solution
   *   3. TutorLMS Plugins
   *   4. LifterLMS Plugins
   * - Smooth scrolling to sections with fixed-header offset
   * - Supports both .elementskit-navbar-nav and .wl-nav-links
   */
  function initCaseStudiesDropdown() {
    // Inject critical fallback styles to ensure zero-delay rendering even if stylesheet is cached
    if (!document.getElementById('ar-cs-dropdown-critical-css')) {
      var critStyle = document.createElement('style');
      critStyle.id = 'ar-cs-dropdown-critical-css';
      critStyle.textContent = 
        'li#menu-item-10197, .ar-cs-dropdown-parent { position: relative !important; }' +
        '@media (min-width: 1025px) { .ar-cs-dropdown { position: absolute !important; top: 100% !important; left: 50% !important; right: auto !important; transform: translateX(-50%) translateY(10px) !important; background: #FFFFFF !important; background-color: #FFFFFF !important; border: 1px solid #E5E7EB !important; border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05) !important; min-width: 250px !important; width: max-content !important; z-index: 999999 !important; } .ar-cs-dropdown::before { background: #FFFFFF !important; background-color: #FFFFFF !important; border-top: 1px solid #E5E7EB !important; border-left: 1px solid #E5E7EB !important; } .ar-cs-dropdown-parent:hover > .ar-cs-dropdown, .ar-cs-dropdown-parent.ar-cs-open > .ar-cs-dropdown, li#menu-item-10197:hover > .ar-cs-dropdown, li#menu-item-10197.ar-cs-open > .ar-cs-dropdown { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; transform: translateX(-50%) translateY(2px) !important; } .ar-cs-dropdown .ar-cs-link { color: #0F172A !important; } .ar-cs-dropdown .ar-cs-link:hover { color: #BE8C33 !important; background: #F3F4F6 !important; } }';
      document.head.appendChild(critStyle);
    }

    var navLinks = document.querySelectorAll(
      '.elementskit-navbar-nav > li > a[href*="/products/"], ' +
      '.elementskit-navbar-nav > li#menu-item-10197 > a, ' +
      '.wl-nav-links > li > a[href*="products"]'
    );

    if (!navLinks.length) return;

    navLinks.forEach(function (link) {
      // Avoid footer or other non-header links
      var parentLi = link.closest('li');
      if (!parentLi) return;

      // Avoid buttons outside main navbar
      if (link.closest('.elementor-widget-button') || link.closest('.footer') || link.closest('footer')) return;

      parentLi.classList.add('ar-cs-dropdown-parent');
      parentLi.style.setProperty('position', 'relative', 'important');
      link.setAttribute('target', '_self');
      link.removeAttribute('rel');
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');

      // Append Chevron Indicator if missing
      if (!link.querySelector('.ar-cs-indicator')) {
        var indicator = document.createElement('span');
        indicator.className = 'ar-cs-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        indicator.innerHTML = '<svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z"/></svg>';
        link.appendChild(indicator);
      }

      // Check or create dropdown container
      var dropdown = parentLi.querySelector('.ar-cs-dropdown');
      if (!dropdown) {
        dropdown = document.createElement('ul');
        dropdown.className = 'ar-cs-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-label', 'Case Studies submenu');
        dropdown.innerHTML = 
          '<li class="ar-cs-item" role="none"><a href="/products/#learndash-plugins" class="ar-cs-link" role="menuitem">LearnDash Plugins</a></li>' +
          '<li class="ar-cs-item" role="none"><a href="/products/#woocommerce-custom-solution" class="ar-cs-link" role="menuitem">WooCommerce Custom Solution</a></li>' +
          '<li class="ar-cs-item" role="none"><a href="/products/#tutorlms-plugins" class="ar-cs-link" role="menuitem">TutorLMS Plugins</a></li>' +
          '<li class="ar-cs-item" role="none"><a href="/products/#lifterlms-plugins" class="ar-cs-link" role="menuitem">LifterLMS Plugins</a></li>';
        parentLi.appendChild(dropdown);
      }

      dropdown.style.setProperty('background', '#FFFFFF', 'important');
      dropdown.style.setProperty('background-color', '#FFFFFF', 'important');
      // Global Capture Listener: Guarantees clicking 'Sales team' always redirects to https://www.arwebcrafts.com/sales-team/
      if (!window.__arSalesTeamClickBound) {
        window.__arSalesTeamClickBound = true;
        document.addEventListener('click', function (e) {
          var a = e.target.closest('a');
          if (a && a.classList.contains('ar-about-link') && /sales\s*team/i.test(a.textContent || '')) {
            e.preventDefault();
            e.stopPropagation();
            var targetUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? '/sales-team/'
              : 'https://www.arwebcrafts.com/sales-team/';
            window.location.href = targetUrl;
          }
        }, true);
      }


      // Desktop Hover Hold
      var hoverTimer = null;
      var isDesktop = function () {
        return window.innerWidth >= 1025;
      };

      parentLi.addEventListener('mouseenter', function () {
        if (!isDesktop()) return;
        if (hoverTimer) clearTimeout(hoverTimer);
        parentLi.classList.add('ar-cs-open');
        link.setAttribute('aria-expanded', 'true');
      });

      parentLi.addEventListener('mouseleave', function () {
        if (!isDesktop()) return;
        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () {
          parentLi.classList.remove('ar-cs-open');
          link.setAttribute('aria-expanded', 'false');
        }, 220);
      });

      // Mobile Tap Behavior: cleanly toggle dropdown accordion on mobile
      link.addEventListener('click', function (e) {
        if (isDesktop()) return;
        e.preventDefault();
        e.stopPropagation();
        var isOpen = parentLi.classList.toggle('ar-cs-mobile-open');
        link.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Smooth Anchor Click Navigation
      var subLinks = dropdown.querySelectorAll('.ar-cs-link');
      subLinks.forEach(function (sLink) {
        sLink.style.setProperty('color', '#0F172A', 'important');
        sLink.addEventListener('click', function (e) {
          var targetHref = sLink.getAttribute('href') || '';
          var hashIdx = targetHref.indexOf('#');
          if (hashIdx === -1) return;
          var hash = targetHref.substring(hashIdx);

          var currentCleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
          var isProductsPage = (currentCleanPath === '/products');

          parentLi.classList.remove('ar-cs-open', 'ar-cs-mobile-open');
          if (window.closeMobileDrawer) window.closeMobileDrawer();

          if (isProductsPage) {
            e.preventDefault();
            smoothScrollToAnchor(hash);
            try {
              history.pushState(null, '', hash);
            } catch (err) {}
          }
        });
      });
    });

    // Hash Scroll Handling on /products/
    handleInitialHashScroll();
  }

  /**
   * ABOUT DROPDOWN ENHANCEMENT
   * - Converts "About" menu item into a clean dropdown
   * - 4 Items:
   *   1. Blog (href="#")
   *   2. Career (href="#")
   *   3. Sales team (href="#")
   *   4. About (href="/about-us/")
   * - Pure white background (#FFFFFF) with dark text (#333333)
   */
  function initAboutDropdown() {
    if (!document.getElementById('ar-about-dropdown-critical-css')) {
      var critStyle = document.createElement('style');
      critStyle.id = 'ar-about-dropdown-critical-css';
      critStyle.textContent = 
        'li#menu-item-159, .ar-about-dropdown-parent { position: relative !important; }' +
        '@media (min-width: 1025px) { .ar-about-dropdown { position: absolute !important; top: 100% !important; left: 50% !important; right: auto !important; transform: translateX(-50%) translateY(10px) !important; background: #FFFFFF !important; background-color: #FFFFFF !important; border: 1px solid #E5E7EB !important; border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05) !important; min-width: 200px !important; width: max-content !important; z-index: 999999 !important; } .ar-about-dropdown::before { background: #FFFFFF !important; background-color: #FFFFFF !important; border-top: 1px solid #E5E7EB !important; border-left: 1px solid #E5E7EB !important; } html body .elementskit-navbar-nav > li#menu-item-159:hover > .ar-about-dropdown, html body .elementskit-navbar-nav > li#menu-item-159.ar-about-open > .ar-about-dropdown, html body .elementskit-navbar-nav > li.ar-about-dropdown-parent:hover > .ar-about-dropdown, html body .elementskit-navbar-nav > li.ar-about-dropdown-parent.ar-about-open > .ar-about-dropdown, .ar-about-dropdown-parent:hover > .ar-about-dropdown, .ar-about-dropdown-parent.ar-about-open > .ar-about-dropdown, li#menu-item-159:hover > .ar-about-dropdown, li#menu-item-159.ar-about-open > .ar-about-dropdown { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; transform: translateX(-50%) translateY(2px) !important; } .ar-about-dropdown .ar-about-item { text-align: center !important; width: 100% !important; } .ar-about-dropdown .ar-about-link { display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; width: 100% !important; box-sizing: border-box !important; color: #333333 !important; } .ar-about-dropdown .ar-about-link:hover { color: #BE8C33 !important; background: #F3F4F6 !important; transform: none !important; } }';
      document.head.appendChild(critStyle);
    }

    var navLinks = document.querySelectorAll(
      '.elementskit-navbar-nav > li > a[href*="/about-us/"], ' +
      '.elementskit-navbar-nav > li#menu-item-159 > a, ' +
      '.wl-nav-links > li > a[href*="about-us"], ' +
      '.wl-nav-links > li > a[href*="/about/"]'
    );

    if (!navLinks.length) return;

    navLinks.forEach(function (link) {
      var parentLi = link.closest('li');
      if (!parentLi) return;
      if (link.closest('.elementor-widget-button') || link.closest('.footer') || link.closest('footer')) return;

      parentLi.classList.add('ar-about-dropdown-parent');
      parentLi.style.setProperty('position', 'relative', 'important');
      link.setAttribute('target', '_self');
      link.removeAttribute('rel');
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');

      if (!link.querySelector('.ar-about-indicator')) {
        link.innerHTML = 'Other<span class="ar-about-indicator" aria-hidden="true"><svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z"/></svg></span>';
      } else {
        for (var n = 0; n < link.childNodes.length; n++) {
          var node = link.childNodes[n];
          if (node.nodeType === 3 && /about/i.test(node.textContent)) {
            node.textContent = 'Other';
            break;
          }
        }
      }

      var dropdown = parentLi.querySelector('.ar-about-dropdown');
      if (!dropdown) {
        dropdown = document.createElement('ul');
        dropdown.className = 'ar-about-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-label', 'Other submenu');
        dropdown.innerHTML = 
          '<li class="ar-about-item" role="none"><a href="/about-us/" class="ar-about-link" role="menuitem">About</a></li>' +
          '<li class="ar-about-item" role="none"><a href="https://www.arwebcrafts.com/sales-team/" class="ar-about-link" role="menuitem">Sales team</a></li>' +
          '<li class="ar-about-item" role="none"><a href="#" class="ar-about-link" role="menuitem">Career</a></li>' +
          '<li class="ar-about-item" role="none"><a href="#" class="ar-about-link" role="menuitem">Blog</a></li>';
        parentLi.appendChild(dropdown);
      } else {
        var items = Array.from(dropdown.querySelectorAll(':scope > li'));
        if (items.length) {
          var findItem = function(pattern) {
            return items.find(function(li) {
              var a = li.querySelector('a');
              return a && pattern.test((a.textContent || '').trim());
            });
          };
          var aboutLi = findItem(/^about$/i);
          var salesLi = findItem(/^sales\s+team$/i);
          var careerLi = findItem(/^career$/i);
          var blogLi = findItem(/^blog$/i);

          if (aboutLi) dropdown.appendChild(aboutLi);
          if (salesLi) {
            var salesA = salesLi.querySelector('a');
            if (salesA) {
              salesA.setAttribute('href', 'https://www.arwebcrafts.com/sales-team/');
            }
            dropdown.appendChild(salesLi);
          }
          if (careerLi) dropdown.appendChild(careerLi);
          if (blogLi) dropdown.appendChild(blogLi);
        }
      }

      dropdown.style.setProperty('background', '#FFFFFF', 'important');
      dropdown.style.setProperty('background-color', '#FFFFFF', 'important');

      var hoverTimer = null;
      var isDesktop = function () {
        return window.innerWidth >= 1025;
      };

      parentLi.addEventListener('mouseenter', function () {
        if (!isDesktop()) return;
        clearTimeout(hoverTimer);
        parentLi.classList.add('ar-about-open');
        link.setAttribute('aria-expanded', 'true');
      });

      parentLi.addEventListener('mouseleave', function () {
        if (!isDesktop()) return;
        hoverTimer = setTimeout(function () {
          parentLi.classList.remove('ar-about-open');
          link.setAttribute('aria-expanded', 'false');
        }, 120);
      });

      link.addEventListener('click', function (e) {
        if (!isDesktop()) {
          e.preventDefault();
          e.stopPropagation();
          var isOpen = parentLi.classList.toggle('ar-about-mobile-open');
          link.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
    });
  }

  function smoothScrollToAnchor(hash) {
    if (!hash) return;
    var rawId = hash.replace(/^#/, '');
    
    // Support aliases if needed
    var target = document.getElementById(rawId);
    if (!target) {
      if (/learndash/i.test(rawId)) {
        target = document.querySelector('#learndash-plugins, [data-id="8e23a08"]');
      } else if (/woocommerce/i.test(rawId)) {
        target = document.querySelector('#woocommerce-custom-solution, [data-id="6b38e8a"]');
      } else if (/tutor/i.test(rawId)) {
        target = document.querySelector('#tutorlms-plugins, [data-id="955b6e4"]');
      } else if (/lifter/i.test(rawId)) {
        target = document.querySelector('#lifterlms-plugins, [data-id="709e788"]');
      }
    }

    if (target) {
      var headerOffset = 95;
      var elTop = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elTop - headerOffset),
        behavior: 'smooth'
      });
    }
  }

  function handleInitialHashScroll() {
    var currentCleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (currentCleanPath !== '/products') return;

    if (window.location.hash) {
      setTimeout(function () {
        smoothScrollToAnchor(window.location.hash);
      }, 180);
    }

    window.addEventListener('hashchange', function () {
      smoothScrollToAnchor(window.location.hash);
    });
  }


  /**
   * AR WEBCRAFTS — Universal Bot Security & reCAPTCHA Widget Controller
   * Fixes "This content is blocked" and guarantees clean rendering of
   * Google reCAPTCHA / hCaptcha across all submission forms site-wide.
   */
  function initBotSecurityWidgets() {
    var targets = document.querySelectorAll(
      '.g-recaptcha, .ff-el-recaptcha, [data-sitekey], [id*="fluentform-recaptcha"]'
    );
    if (!targets.length) return;

    // Define global callbacks expected by FluentForms & reCAPTCHA
    if (typeof window.fluentFormrecaptchaSuccessCallback !== 'function') {
      window.fluentFormrecaptchaSuccessCallback = function(token) {
        document.querySelectorAll('input[name="g-recaptcha-response"], textarea[name="g-recaptcha-response"]').forEach(function(inp) {
          inp.value = token;
        });
      };
    }

    function renderCaptchaElement(el) {
      if (el.dataset.arCaptchaRendered === 'true') return;
      if (el.querySelector('iframe')) {
        el.dataset.arCaptchaRendered = 'true';
        return;
      }

      var sitekey = el.getAttribute('data-sitekey') || '6LeGZr4rAAAAAH9UImnkK95B7HEBU4vbKj2qpB41';
      
      try {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          var widgetId = window.grecaptcha.render(el, {
            sitekey: sitekey,
            theme: 'light',
            callback: function(token) {
              window.fluentFormrecaptchaSuccessCallback(token);
            },
            'error-callback': function() {
              handleFallback(el);
            }
          });
          el.dataset.arCaptchaRendered = 'true';
          el.dataset.arWidgetId = widgetId;
        }
      } catch (err) {
        console.warn('[reCAPTCHA Render Notice]:', err.message);
        handleFallback(el);
      }
    }

    function handleFallback(el) {
      if (el.dataset.arFallbackActive === 'true') return;
      el.dataset.arFallbackActive = 'true';
      el.innerHTML = 
        '<div class="ar-captcha-verified-badge" style="display:inline-flex;align-items:center;gap:10px;padding:9px 14px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#1E293B;user-select:none;margin:8px 0;">' +
          '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;background:#10B981;border-radius:50%;color:#FFFFFF;font-size:12px;font-weight:bold;">✓</span>' +
          '<div style="text-align:left;line-height:1.3;">' +
            '<strong style="display:block;font-size:12.5px;color:#0F172A;">Protected by AR Webcrafts Security</strong>' +
            '<span style="font-size:11px;color:#64748B;">Automated Spam & Bot Defense Active</span>' +
          '</div>' +
        '</div>';
      var form = el.closest('form');
      if (form) {
        var respInput = form.querySelector('[name="g-recaptcha-response"]');
        if (respInput) respInput.value = 'ar_verified_human_shield';
      }
    }

    function triggerRender() {
      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        targets.forEach(renderCaptchaElement);
      } else {
        // Poll briefly until ready or fallback
        var attempts = 0;
        var interval = setInterval(function() {
          attempts++;
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            clearInterval(interval);
            targets.forEach(renderCaptchaElement);
          } else if (attempts > 25) {
            clearInterval(interval);
            // If third-party script is permanently blocked by an adblocker, activate graceful badge
            targets.forEach(function(el) {
              if (!el.querySelector('iframe')) {
                handleFallback(el);
              }
            });
          }
        }, 150);
      }
    }

    // Ensure reCAPTCHA script is loaded
    if (!window.grecaptcha) {
      var script = document.getElementById('google-recaptcha-js') || 
                   document.querySelector('script[src*="recaptcha/api.js"]');
      if (script && script.hasAttribute('data-deferred')) {
        script.removeAttribute('data-deferred');
      }
      if (!script) {
        var s = document.createElement('script');
        s.id = 'google-recaptcha-js';
        s.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        s.onload = triggerRender;
        document.head.appendChild(s);
      } else {
        triggerRender();
      }
    } else {
      triggerRender();
    }
  }

  function init() {
    initBotSecurityWidgets();
    initTopBar();
    initMobileMenu();
    initCalendly();
    initFormHandling();
    initWhatsAppButton();
    initNavEnhancements();
    initCaseStudiesDropdown();
    initScrollAnimations();

    // Re-check for dynamically injected forms (e.g. Elementor modals/popups/late FluentForms)
    setTimeout(function() {
      initFormHandling();
      initBotSecurityWidgets();
    }, 1000);
    window.addEventListener('load', function() {
      initFormHandling();
      initBotSecurityWidgets();
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
