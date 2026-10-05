/**
 * AR WEBCRAFTS LLC — Global Enhancements & Mobile Interactive Features
 * 1. Robust Mobile Hamburger Menu Drawer (Open, Close, Nav, Backdrop, Esc)
 * 2. Calendly Full-Height Responsive Embedding & Auto-Height Resizing
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

    widgets.forEach(function (widget) {
      var url = widget.getAttribute('data-url') || 'https://calendly.com/arwebcrafts/30-mint?hide_gdpr_banner=1';
      widget.style.minWidth = '320px';
      widget.style.width = '100%';
      widget.style.minHeight = '700px';
      widget.style.height = '750px';

      var iframe = widget.querySelector('iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.title = 'Select a Date & Time - Calendly';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.minHeight = '700px';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        widget.appendChild(iframe);
      } else {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.minHeight = '700px';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
      }
    });

    // Dynamically adjust height if Calendly sends postMessage
    window.addEventListener('message', function (e) {
      if (e.data && e.data.event === 'calendly.page_height' && e.data.payload && e.data.payload.height) {
        widgets.forEach(function (w) {
          var h = Math.max(700, parseInt(e.data.payload.height, 10));
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

  function init() {
    initMobileMenu();
    initCalendly();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
