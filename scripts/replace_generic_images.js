const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Explicit Service Pages Map
const serviceImageMap = {
  'services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/ar-services-hub.svg',
    alt: 'AR Webcrafts Full-Stack Digital Solutions Suite'
  },
  'wordpress-plugin-development/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*talha\.jpg)/gi, /(\/wp-content\/uploads\/[^\s"'>]*talha-\d+x\d+\.jpg)/gi],
    replacement: '/wp-content/uploads/modern/wordpress-plugin-architecture.svg',
    alt: 'Bespoke Custom WordPress Plugin Architecture & Engineering'
  },
  'woocommerce-custom-development/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/woocommerce-custom-storefront.svg',
    alt: 'High-Conversion WooCommerce Engineering & Checkout Architecture'
  },
  'api-integrations-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/api-integrations-hub.svg',
    alt: 'Enterprise API Integrations & Webhook Hub'
  },
  'custom-websites-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/custom-web-engineering.svg',
    alt: 'Custom Website Engineering & Performance Architecture'
  },
  'ecommerce-website-development-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/ecommerce-enterprise-store.svg',
    alt: 'Scalable Enterprise eCommerce Storefront Development'
  },
  'learndash-website-development-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/learndash-lms-engine.svg',
    alt: 'LearnDash LMS Architecture & Custom Course Builder'
  },
  'woocommerce-maintenance-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/woocommerce-maintenance-speed.svg',
    alt: '24/7 WooCommerce Maintenance, Speed & Security Monitoring'
  },
  'woocommerce-order-tracking-plugin-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/woocommerce-order-tracking.svg',
    alt: 'Automated Multi-Carrier Order Tracking Suite'
  },
  'wordpress-plugin-maintenance-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/plugin-maintenance-security.svg',
    alt: 'Continuous Plugin Lifecycle, Testing & Security Hardening'
  },
  'wordpress-site-maintenance-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/wordpress-site-care-maintenance.svg',
    alt: 'Enterprise WordPress Care, Daily S3 Backups & Uptime Protection'
  },
  'wordpress-theme-development-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/wordpress-theme-development.svg',
    alt: 'Custom WordPress Theme Development & Full-Site Editing'
  },
  'workflow-automation-services/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*young-programmer-working[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/workflow-automation-engine.svg',
    alt: 'End-to-End Workflow Automation & Multi-Step Logic Pipelines'
  },
  'free-quote/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*Laptop-Image-Talha-Work[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/free-quote-consultation.svg',
    alt: 'Free Technical Discovery & Scope Consultation'
  },
  'learndash-add-ons/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*happy-creative-marketing-team[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/learndash-addons-ecosystem.svg',
    alt: 'LearnDash Add-ons Ecosystem'
  },
  'ai-automation/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*happy-creative-marketing-team[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/ai-automation-agents.svg',
    alt: 'Autonomous AI Agents & Enterprise Workflow Matrix'
  },
  'hire-a-full-stack-wordpress-developer/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*Top-wordpress-Developers[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/hire-full-stack-developer.svg',
    alt: 'Hire Dedicated Senior WordPress & Full-Stack Developers'
  },
  'how-wp-plugin-developers-can-help-customize-business-website/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*How-WordPress-Plugin-Developers-Can-Help-You-Customize-Your-Business-Website[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/wordpress-plugin-architecture.svg',
    alt: 'How WordPress Plugin Developers Help Customize Business Websites'
  },
  'wordpress-plugin-developers-customize-your-website/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*WordPress-plugin-developers-Experts[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/wordpress-plugin-architecture.svg',
    alt: 'Custom WordPress Plugin Engineering Experts'
  },
  'wordpress-plugin-developers-company-in-california/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*Best-WordPress-Plugin-Developers-in-California[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/hire-full-stack-developer.svg',
    alt: 'Dedicated WordPress Plugin Developers'
  },
  'hire-expert-wordpress-plugin-developers/index.html': {
    targetPatterns: [/(\/wp-content\/uploads\/[^\s"'>]*How-to-Hire-Expert-WordPress-Plugin-Developers[^\s"'>]*)/gi],
    replacement: '/wp-content/uploads/modern/hire-full-stack-developer.svg',
    alt: 'Hire Expert WordPress Plugin Developers'
  }
};

// Process Service Pages
for (const [relPath, config] of Object.entries(serviceImageMap)) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  for (const pat of config.targetPatterns) {
    if (pat.test(content)) {
      content = content.replace(pat, config.replacement);
      modified = true;
    }
  }

  // Also sanitize srcset if it still contains old image references
  content = content.replace(new RegExp(`srcset="[^"]*${config.replacement}[^"]*"`, 'g'), `srcset="${config.replacement}"`);
  content = content.replace(new RegExp(`data-srcset="[^"]*${config.replacement}[^"]*"`, 'g'), `data-srcset="${config.replacement}"`);

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated images in: ${relPath} -> ${config.replacement}`);
  }
}

// 2. Process Portfolio Page & Portfolio Inner Pages
const portfolioFile = path.join(rootDir, 'portfolio', 'index.html');
if (fs.existsSync(portfolioFile)) {
  let content = fs.readFileSync(portfolioFile, 'utf8');

  // Hero image replacements
  content = content.replace(/\/wp-content\/uploads\/2024\/04\/placeholder-4-1024x683\.png/g, '/wp-content/uploads/modern/portfolio-hero-showcase.svg');
  content = content.replace(/\/wp-content\/uploads\/2024\/04\/placeholder-4\.png/g, '/wp-content/uploads/modern/portfolio-hero-showcase.svg');
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Laptop-Image-Talha-Work-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-hero-showcase.svg');

  // Card 7: CF7 WOW Styler
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-3-Talha-1-scaled\.jpg/g, '/wp-content/uploads/modern/portfolio-cf7-wow-styler.svg');
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-3-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-cf7-wow-styler.svg');

  // Card 8: WebinarIgnition
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-2-Talha-1-scaled\.jpg/g, '/wp-content/uploads/modern/portfolio-webinar-ignition.svg');
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-2-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-webinar-ignition.svg');

  // Card 9: 5 Stars Rating Funnel
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-1-Talha-1-scaled\.jpg/g, '/wp-content/uploads/modern/portfolio-five-star-funnel.svg');
  content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-1-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-five-star-funnel.svg');

  fs.writeFileSync(portfolioFile, content, 'utf8');
  console.log('Updated portfolio/index.html with modern cards and hero showcase!');
}

// Portfolio Inner Pages
const innerPortfolioPages = [
  'portfolio/cf7-custom-styler/index.html',
  'portfolio/webinar-ignition/index.html',
  'portfolio/five-star-funnel/index.html',
  'portfolio/intercarrier-logistics/index.html',
  'portfolio/sanjrani-metals-bahrain/index.html'
];

for (const innerPath of innerPortfolioPages) {
  const fullPath = path.join(rootDir, innerPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-3-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-cf7-wow-styler.svg');
    content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-2-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-webinar-ignition.svg');
    content = content.replace(/\/wp-content\/uploads\/2024\/05\/Image-on-Tab-Mobile-1-Talha-1[^\s"'>]*/g, '/wp-content/uploads/modern/portfolio-five-star-funnel.svg');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated inner portfolio page: ${innerPath}`);
  }
}
