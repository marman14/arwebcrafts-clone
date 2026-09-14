/**
 * AR Webcrafts - Client-Side Interactive Engine
 * Controls Header Megamenu, Mobile Navigation Drawer, Form Interactivity,
 * Animated Counters, FAQ Accordions, and WhatsApp Live Chat.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer & Toggle
  const hamburgerBtn = document.querySelector('.elementskit-menu-hamburger');
  const menuContainer = document.querySelector('.elementskit-menu-container');
  const menuOverlay = document.querySelector('.ekit-nav-menu--overlay');
  const closeBtn = document.querySelector('.elementskit-menu-close');

  function openMobileMenu() {
    if (menuContainer) menuContainer.classList.add('elementskit-menu-open');
    if (menuOverlay) menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (menuContainer) menuContainer.classList.remove('elementskit-menu-open');
    if (menuOverlay) menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMobileMenu);

  // Mobile Submenu Accordion Toggle
  const dropdownNavItems = document.querySelectorAll('.elementskit-dropdown-has');
  dropdownNavItems.forEach(item => {
    const link = item.querySelector('.ekit-menu-nav-link');
    const panel = item.querySelector('.elementskit-megamenu-panel');
    if (link && panel) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          panel.classList.toggle('active');
        }
      });
    }
  });

  // 2. Animated Stats Counters
  const counters = document.querySelectorAll('.elementor-counter-number');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-to-value') || el.innerText, 10);
          const from = parseInt(el.getAttribute('data-from-value') || '0', 10);
          const duration = parseInt(el.getAttribute('data-duration') || '1500', 10);
          let startTime = null;

          function animateCounter(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * (target - from) + from);
            el.innerText = currentVal;
            if (progress < 1) {
              requestAnimationFrame(animateCounter);
            } else {
              el.innerText = target;
            }
          }

          requestAnimationFrame(animateCounter);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // 3. FAQ Accordion Interaction
  const accordionTitles = document.querySelectorAll('.elementor-tab-title');
  accordionTitles.forEach(title => {
    title.addEventListener('click', () => {
      const content = title.nextElementSibling;
      const isActive = title.classList.contains('elementor-active');

      // Close siblings if in standard elementor accordion
      const parent = title.closest('.elementor-accordion');
      if (parent) {
        parent.querySelectorAll('.elementor-tab-title').forEach(t => t.classList.remove('elementor-active'));
        parent.querySelectorAll('.elementor-tab-content').forEach(c => {
          c.classList.remove('elementor-active');
          c.style.display = 'none';
        });
      }

      if (!isActive && content) {
        title.classList.add('elementor-active');
        content.classList.add('elementor-active');
        content.style.display = 'block';
      }
    });
  });

  // 4. Toast Notification Engine
  function showToast(title, message, isError = false) {
    let container = document.getElementById('ar-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ar-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ar-toast ${isError ? 'ar-toast-error' : ''}`;
    toast.innerHTML = `
      <div class="ar-toast-icon">${isError ? '⚠️' : '✅'}</div>
      <div class="ar-toast-content">
        <div class="ar-toast-title">${title}</div>
        <div class="ar-toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // 5. Interactive Form Handlers
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check required fields
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      let firstEmpty = null;

      inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#ef4444';
          if (!firstEmpty) firstEmpty = input;
        } else {
          input.style.borderColor = '';
        }
      });

      if (!isValid) {
        if (firstEmpty) firstEmpty.focus();
        showToast('Required Fields Missing', 'Please fill out all required fields before submitting.', true);
        return;
      }

      // Submit feedback animation
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitBtn ? (submitBtn.innerText || submitBtn.value) : '';

      if (submitBtn) {
        submitBtn.classList.add('ar-btn-loading');
        if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Submitting...';
        else submitBtn.innerText = 'Submitting...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('ar-btn-loading');
          if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
          else submitBtn.innerText = originalText;
        }

        form.reset();
        showToast(
          'Inquiry Received!',
          'Thank you for contacting AR Webcrafts. A senior technical consultant will review your request and get in touch within 24 hours.'
        );
      }, 1000);
    });
  });

  // 6. WhatsApp Live Chat Floating Widget
  initWhatsAppWidget();
});

function initWhatsAppWidget() {
  if (document.getElementById('ar-wa-widget')) return;

  const WA_ICON = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";
  const WA_LINK = "https://wa.me/+13072784862?text=Hi%20AR%20Webcrafts!%20I%20visited%20your%20website%20and%20I'm%20interested%20in%20your%20web%20design%20and%20development%20services.%20Can%20we%20talk%3F";

  const widget = document.createElement('div');
  widget.id = 'ar-wa-widget';
  widget.innerHTML = `
    <div id="ar-wa-popup">
      <div class="ar-wa-header">
        <div class="ar-wa-avatar"><img src="${WA_ICON}" alt="AR Webcrafts WhatsApp"></div>
        <div class="ar-wa-info">
          <div class="ar-wa-name">AR Webcrafts</div>
          <div class="ar-wa-status"><span class="ar-wa-dot"></span> Typically replies instantly</div>
        </div>
        <button class="ar-wa-x" id="ar-wa-close" aria-label="Close chat">✕</button>
      </div>
      <div class="ar-wa-body">
        <div class="ar-wa-bubble">
          Need a professional website, custom plugin, or want to scale your business? We build high-converting WordPress sites — fast turnaround, fixed price. Get a FREE quote today! 🚀
          <div class="ar-wa-time">Just now</div>
        </div>
      </div>
      <a href="${WA_LINK}" target="_blank" rel="noopener noreferrer" class="ar-wa-cta">
        <img src="${WA_ICON}" alt=""> Chat with a Developer
      </a>
    </div>
    <div id="ar-wa-fab" role="button" aria-label="Open WhatsApp Chat">
      <img src="${WA_ICON}" alt="WhatsApp">
      <span id="ar-wa-badge">1</span>
    </div>
  `;

  document.body.appendChild(widget);

  const popup = document.getElementById('ar-wa-popup');
  const fab = document.getElementById('ar-wa-fab');
  const badge = document.getElementById('ar-wa-badge');
  const closeX = document.getElementById('ar-wa-close');

  function openPopup() {
    if (popup) popup.classList.add('ar-visible');
    if (badge) badge.style.display = 'none';
  }

  function closePopup(e) {
    if (e) e.stopPropagation();
    if (popup) popup.classList.remove('ar-visible');
  }

  if (fab) {
    fab.addEventListener('click', () => {
      if (popup && popup.classList.contains('ar-visible')) {
        closePopup();
      } else {
        openPopup();
      }
    });
  }

  if (closeX) closeX.addEventListener('click', closePopup);

  // Auto show popup after 4 seconds
  setTimeout(openPopup, 4000);
}
