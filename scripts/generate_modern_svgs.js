const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'wp-content', 'uploads', 'modern');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function baseSvg({ width = 800, height = 533, category, titleRight, children }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020d1c"/>
      <stop offset="50%" stop-color="#011B39"/>
      <stop offset="100%" stop-color="#082245"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2D184"/>
      <stop offset="50%" stop-color="#BE8C33"/>
      <stop offset="100%" stop-color="#8a6114"/>
    </linearGradient>
    <pattern id="grid-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#BE8C33" fill-opacity="0.12"/>
    </pattern>
    <filter id="svg-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" rx="16" fill="url(#bg-grad)"/>
  <rect width="${width}" height="${height}" rx="16" fill="url(#grid-pattern)"/>
  <circle cx="${width/2}" cy="${height/2}" r="210" fill="#BE8C33" fill-opacity="0.07" filter="url(#svg-glow)"/>

  ${category ? `
  <g transform="translate(44, 34)">
    <rect width="${category.width || 240}" height="32" rx="16" fill="#031b38" stroke="#BE8C33" stroke-width="1.2"/>
    <circle cx="18" cy="16" r="5" fill="#BE8C33"/>
    <text x="32" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">${category.text}</text>
  </g>` : ''}

  ${titleRight ? `
  <g transform="translate(${width - 240}, 34)">
    <rect width="196" height="32" rx="16" fill="#07244a" stroke="#255a9b" stroke-width="1"/>
    <text x="18" y="21" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#93c5fd">${titleRight}</text>
  </g>` : ''}

  ${children}
</svg>`;
}

// 1. API Integrations Hub
const apiIntegrationsSvg = baseSvg({
  category: { text: "API INTEGRATIONS & WEBHOOKS", width: 260 },
  titleRight: "Latency: <tspan fill='#4ade80' font-weight='700'>38ms</tspan> &#x2022; 200 OK",
  children: `
  <!-- Main Central Node Architecture -->
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">api-gateway.arwebcrafts.io/v2/sync</text>
    
    <!-- Central Node -->
    <g transform="translate(286, 120)">
      <rect width="140" height="90" rx="12" fill="#0b2447" stroke="#BE8C33" stroke-width="2"/>
      <circle cx="70" cy="34" r="14" fill="#BE8C33"/>
      <text x="70" y="39" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="800" fill="#011B39">API</text>
      <text x="70" y="66" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Unified Gateway</text>
      <text x="70" y="80" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#F2D184">Real-Time Sync</text>
    </g>

    <!-- Node 1: Stripe Payments (Left) -->
    <g transform="translate(40, 70)">
      <rect width="180" height="74" rx="10" fill="#031021" stroke="#3b82f6" stroke-width="1.2"/>
      <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Stripe &amp; PayPal</text>
      <text x="16" y="46" font-family="sans-serif" font-size="10" fill="#94a3b8">Webhooks &amp; Recurring Billing</text>
      <circle cx="160" cy="24" r="5" fill="#4ade80"/>
      <text x="16" y="62" font-family="monospace" font-size="9" fill="#38bdf8">POST /v1/charges/sync</text>
      <!-- Connection Line -->
      <line x1="180" y1="37" x2="286" y2="140" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,4"/>
    </g>

    <!-- Node 2: CRM & Marketing (Left Bottom) -->
    <g transform="translate(40, 190)">
      <rect width="180" height="74" rx="10" fill="#031021" stroke="#f59e0b" stroke-width="1.2"/>
      <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">HubSpot &amp; Salesforce</text>
      <text x="16" y="46" font-family="sans-serif" font-size="10" fill="#94a3b8">Bi-directional Lead Sync</text>
      <circle cx="160" cy="24" r="5" fill="#4ade80"/>
      <text x="16" y="62" font-family="monospace" font-size="9" fill="#F2D184">GraphQL CustomerNode</text>
      <!-- Connection Line -->
      <line x1="180" y1="37" x2="286" y2="180" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4"/>
    </g>

    <!-- Node 3: ERP & Logistics (Right) -->
    <g transform="translate(492, 70)">
      <rect width="180" height="74" rx="10" fill="#031021" stroke="#10b981" stroke-width="1.2"/>
      <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">SAP &amp; Custom ERP</text>
      <text x="16" y="46" font-family="sans-serif" font-size="10" fill="#94a3b8">Automated Stock &amp; Inventory</text>
      <circle cx="160" cy="24" r="5" fill="#4ade80"/>
      <text x="16" y="62" font-family="monospace" font-size="9" fill="#34d399">REST /api/v2/inventory</text>
      <!-- Connection Line -->
      <line x1="0" y1="37" x2="-66" y2="70" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4"/>
    </g>

    <!-- Node 4: Zapier & Webhooks (Right Bottom) -->
    <g transform="translate(492, 190)">
      <rect width="180" height="74" rx="10" fill="#031021" stroke="#ec4899" stroke-width="1.2"/>
      <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Zapier &amp; Custom Sockets</text>
      <text x="16" y="46" font-family="sans-serif" font-size="10" fill="#94a3b8">Instant Event Triggers</text>
      <circle cx="160" cy="24" r="5" fill="#4ade80"/>
      <text x="16" y="62" font-family="monospace" font-size="9" fill="#f472b6">HMAC Verified Payload</text>
      <!-- Connection Line -->
      <line x1="0" y1="37" x2="-66" y2="-10" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="4,4"/>
    </g>

    <!-- Bottom Payload Stream Terminal -->
    <g transform="translate(40, 290)">
      <rect width="632" height="76" rx="8" fill="#010813" stroke="#1e3a5f" stroke-width="1"/>
      <text x="18" y="24" font-family="monospace" font-size="11" fill="#4ade80">&gt; HTTP/2 200 OK &#x2014; JSON Payload Delivered: {"event":"order.completed","id":"evt_9831","latency_ms":38}</text>
      <text x="18" y="46" font-family="monospace" font-size="11" fill="#94a3b8">&gt; Sync State: 100% Consistent | 0 Queue Drops | Auto-Retry Protocol Active</text>
      <rect x="520" y="14" width="96" height="22" rx="4" fill="#052e16"/>
      <text x="532" y="29" font-family="monospace" font-size="10" font-weight="700" fill="#4ade80">ENCRYPTED</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'api-integrations-hub.svg'), apiIntegrationsSvg);

// 2. Custom Web Engineering
const customWebSvg = baseSvg({
  category: { text: "CUSTOM WEB ENGINEERING", width: 240 },
  titleRight: "Lighthouse: <tspan fill='#4ade80' font-weight='700'>100% Score</tspan>",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">responsive-viewport.arwebcrafts.com</text>

    <!-- Desktop Viewport Frame -->
    <g transform="translate(40, 65)">
      <rect width="360" height="220" rx="8" fill="#020914" stroke="#255a9b" stroke-width="1.5"/>
      <rect width="360" height="30" rx="8" fill="#09203f"/>
      <text x="16" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">Desktop Experience (4K / Retina)</text>
      <!-- Hero Wireframe -->
      <rect x="20" y="48" width="180" height="18" rx="4" fill="#BE8C33"/>
      <rect x="20" y="74" width="130" height="8" rx="2" fill="#475569"/>
      <rect x="20" y="88" width="150" height="8" rx="2" fill="#334155"/>
      <rect x="20" y="108" width="80" height="24" rx="4" fill="#F2D184"/>
      <!-- Grid Cards -->
      <rect x="215" y="48" width="125" height="74" rx="6" fill="#0f2b4e" stroke="#1e4b85" stroke-width="1"/>
      <rect x="20" y="145" width="98" height="60" rx="6" fill="#081a33"/>
      <rect x="130" y="145" width="98" height="60" rx="6" fill="#081a33"/>
      <rect x="240" y="145" width="98" height="60" rx="6" fill="#081a33"/>
    </g>

    <!-- Mobile Viewport Frame (Right) -->
    <g transform="translate(440, 65)">
      <rect width="110" height="220" rx="16" fill="#020914" stroke="#BE8C33" stroke-width="2"/>
      <rect x="35" y="6" width="40" height="6" rx="3" fill="#1e293b"/>
      <rect x="12" y="24" width="86" height="12" rx="3" fill="#BE8C33"/>
      <rect x="12" y="44" width="86" height="50" rx="4" fill="#0f2b4e"/>
      <rect x="12" y="102" width="86" height="40" rx="4" fill="#081a33"/>
      <rect x="12" y="150" width="86" height="40" rx="4" fill="#081a33"/>
      <circle cx="55" cy="206" r="6" fill="#1e293b"/>
    </g>

    <!-- Lighthouse 100 Badges Right -->
    <g transform="translate(580, 65)">
      <rect width="100" height="220" rx="8" fill="#020e1f" stroke="#1d487c" stroke-width="1"/>
      <!-- Circle 1: Performance -->
      <circle cx="50" cy="45" r="24" fill="none" stroke="#4ade80" stroke-width="3"/>
      <text x="50" y="50" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="800" fill="#4ade80">100</text>
      <text x="50" y="80" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#94a3b8">Performance</text>
      <!-- Circle 2: SEO -->
      <circle cx="50" cy="130" r="24" fill="none" stroke="#4ade80" stroke-width="3"/>
      <text x="50" y="135" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="800" fill="#4ade80">100</text>
      <text x="50" y="165" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#94a3b8">SEO &amp; Best</text>
      <text x="50" y="195" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">&#x26A1; Core Vitals</text>
    </g>

    <!-- Bottom Feature Bar -->
    <g transform="translate(40, 305)">
      <rect width="640" height="60" rx="8" fill="#071e3d" stroke="#1e4b85" stroke-width="1"/>
      <text x="24" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">&#x2713; Pixel-Perfect Clean Code</text>
      <text x="24" y="44" font-family="sans-serif" font-size="11" fill="#94a3b8">Semantic HTML5 + SCSS + Fluid Responsive Typography</text>
      <text x="420" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">&#x2713; Zero Framework Bloat</text>
      <text x="420" y="44" font-family="sans-serif" font-size="11" fill="#94a3b8">High-speed sub-500ms global delivery</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'custom-web-engineering.svg'), customWebSvg);

// 3. eCommerce Enterprise Store
const ecommerceSvg = baseSvg({
  category: { text: "ENTERPRISE ECOMMERCE ARCHITECTURE", width: 280 },
  titleRight: "Global Checkout &#x2022; Multi-Currency",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">store-operations.arwebcrafts.io</text>

    <!-- Metrics Cards Row -->
    <g transform="translate(36, 60)">
      <!-- Card 1 -->
      <rect width="200" height="85" rx="8" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
      <text x="16" y="26" font-family="sans-serif" font-size="11" fill="#94a3b8">Total Monthly GMV</text>
      <text x="16" y="56" font-family="sans-serif" font-size="22" font-weight="800" fill="#4ade80">$1,482,900</text>
      <text x="16" y="74" font-family="sans-serif" font-size="10" font-weight="600" fill="#F2D184">&uarr; 34.2% YoY Scalability</text>
      
      <!-- Card 2 -->
      <g transform="translate(220, 0)">
        <rect width="200" height="85" rx="8" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
        <text x="16" y="26" font-family="sans-serif" font-size="11" fill="#94a3b8">Peak Checkout Speed</text>
        <text x="16" y="56" font-family="sans-serif" font-size="22" font-weight="800" fill="#38bdf8">310 ms</text>
        <text x="16" y="74" font-family="sans-serif" font-size="10" font-weight="600" fill="#4ade80">Zero Cart Abandonment Lag</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(440, 0)">
        <rect width="200" height="85" rx="8" fill="#020e1e" stroke="#BE8C33" stroke-width="1.2"/>
        <text x="16" y="26" font-family="sans-serif" font-size="11" fill="#94a3b8">Global Currencies</text>
        <text x="16" y="56" font-family="sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">USD &#x2022; EUR &#x2022; GBP &#x2022; AED</text>
        <text x="16" y="74" font-family="sans-serif" font-size="10" font-weight="600" fill="#F2D184">Real-Time FX Rates</text>
      </g>
    </g>

    <!-- Live Transaction Stream / Chart -->
    <g transform="translate(36, 160)">
      <rect width="640" height="200" rx="10" fill="#020914" stroke="#163866" stroke-width="1"/>
      <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Real-Time Transaction Pipeline</text>
      
      <!-- Item Row 1 -->
      <g transform="translate(20, 42)">
        <rect width="600" height="42" rx="6" fill="#081e3a"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="26" font-family="monospace" font-size="11" fill="#FFFFFF">#ORD-9024 &#x2014; B2B Wholesale Custom Tier</text>
        <text x="430" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">$4,250.00</text>
        <rect x="525" y="10" width="60" height="22" rx="4" fill="#064e3b"/>
        <text x="535" y="25" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">PAID</text>
      </g>

      <!-- Item Row 2 -->
      <g transform="translate(20, 92)">
        <rect width="600" height="42" rx="6" fill="#081e3a"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="26" font-family="monospace" font-size="11" fill="#FFFFFF">#ORD-9023 &#x2014; SaaS Annual Membership Sub</text>
        <text x="430" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">$890.00</text>
        <rect x="525" y="10" width="60" height="22" rx="4" fill="#064e3b"/>
        <text x="535" y="25" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">PAID</text>
      </g>

      <!-- Item Row 3 -->
      <g transform="translate(20, 142)">
        <rect width="600" height="42" rx="6" fill="#081e3a"/>
        <circle cx="20" cy="21" r="5" fill="#38bdf8"/>
        <text x="36" y="26" font-family="monospace" font-size="11" fill="#FFFFFF">#ORD-9022 &#x2014; Multi-Variant High-Ticket Product</text>
        <text x="430" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">$1,120.00</text>
        <rect x="520" y="10" width="68" height="22" rx="4" fill="#1e3a5f"/>
        <text x="528" y="25" font-family="sans-serif" font-size="10" font-weight="700" fill="#38bdf8">SHIPPED</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'ecommerce-enterprise-store.svg'), ecommerceSvg);

// 4. LearnDash LMS Engine
const learndashSvg = baseSvg({
  category: { text: "LEARNDASH & LMS ARCHITECTURE", width: 250 },
  titleRight: "SCORM / xAPI &#x2022; Gamified Learning",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">lms-campus.arwebcrafts.com/curriculum</text>

    <!-- Course Builder Panel (Left) -->
    <g transform="translate(36, 60)">
      <rect width="380" height="300" rx="10" fill="#020c1a" stroke="#255a9b" stroke-width="1"/>
      <rect width="380" height="36" rx="10" fill="#092244"/>
      <text x="18" y="23" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Interactive Course Builder</text>
      <rect x="290" y="8" width="76" height="20" rx="4" fill="#BE8C33"/>
      <text x="298" y="22" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">PUBLISHED</text>

      <!-- Module 1 -->
      <g transform="translate(18, 50)">
        <rect width="344" height="48" rx="6" fill="#071e3d"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">Module 1: Advanced Full-Stack Architecture</text>
        <text x="14" y="38" font-family="sans-serif" font-size="10" fill="#94a3b8">4 Lessons &#x2022; 2 Interactive Quizzes &#x2022; 100% Passed</text>
        <circle cx="320" cy="24" r="8" fill="#4ade80"/>
        <text x="316" y="28" font-family="sans-serif" font-size="11" font-weight="800" fill="#011B39">&#x2713;</text>
      </g>

      <!-- Module 2 -->
      <g transform="translate(18, 110)">
        <rect width="344" height="48" rx="6" fill="#071e3d"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Module 2: Custom WordPress Hook Engine</text>
        <text x="14" y="38" font-family="sans-serif" font-size="10" fill="#94a3b8">6 Lessons &#x2022; Proctored Code Assessment</text>
        <rect x="270" y="14" width="60" height="20" rx="4" fill="#034e35"/>
        <text x="278" y="28" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">ACTIVE</text>
      </g>

      <!-- Module 3 -->
      <g transform="translate(18, 170)">
        <rect width="344" height="48" rx="6" fill="#071e3d"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Module 3: Database &amp; Transient Caching</text>
        <text x="14" y="38" font-family="sans-serif" font-size="10" fill="#94a3b8">3 Lessons &#x2022; Final Certification Exam</text>
        <rect x="270" y="14" width="60" height="20" rx="4" fill="#334155"/>
        <text x="278" y="28" font-family="sans-serif" font-size="10" font-weight="600" fill="#cbd5e1">LOCKED</text>
      </g>

      <!-- Student Progress Bar -->
      <g transform="translate(18, 236)">
        <text x="0" y="14" font-family="sans-serif" font-size="11" font-weight="600" fill="#94a3b8">Student Overall Completion</text>
        <text x="310" y="14" font-family="sans-serif" font-size="11" font-weight="700" fill="#4ade80">78%</text>
        <rect y="24" width="344" height="8" rx="4" fill="#1e293b"/>
        <rect y="24" width="268" height="8" rx="4" fill="#4ade80"/>
      </g>
    </g>

    <!-- Digital Certificate Verification Panel (Right) -->
    <g transform="translate(436, 60)">
      <rect width="240" height="300" rx="10" fill="#020c1a" stroke="#BE8C33" stroke-width="1.2"/>
      <rect width="240" height="36" rx="10" fill="#0d2c54"/>
      <text x="16" y="23" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">VERIFIED CERTIFICATION</text>

      <rect x="20" y="52" width="200" height="130" rx="6" fill="#051a36" stroke="#BE8C33" stroke-width="1" stroke-dasharray="3,3"/>
      <circle cx="120" cy="85" r="18" fill="#BE8C33" fill-opacity="0.2"/>
      <path d="M120 73 L124 81 L133 82 L126 89 L128 98 L120 93 L112 98 L114 89 L107 82 L116 81 Z" fill="#BE8C33"/>
      <text x="120" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Certificate of Excellence</text>
      <text x="120" y="136" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#F2D184">Cryptographically Verified</text>
      <text x="120" y="152" text-anchor="middle" font-family="monospace" font-size="8" fill="#94a3b8">ID: AR-CERT-8849-VERIFIED</text>

      <!-- Share Button -->
      <rect x="20" y="200" width="200" height="34" rx="6" fill="#0a66c2"/>
      <text x="120" y="222" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Share to LinkedIn &#x2197;</text>

      <!-- Verification Badge -->
      <g transform="translate(20, 248)">
        <rect width="200" height="38" rx="6" fill="#072040"/>
        <circle cx="16" cy="19" r="6" fill="#4ade80"/>
        <text x="30" y="16" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Public Verification Portal</text>
        <text x="30" y="29" font-family="sans-serif" font-size="8" fill="#34d399">100% Tamper-Proof Record</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'learndash-lms-engine.svg'), learndashSvg);

// 5. WooCommerce Maintenance & Speed
const wooMaintSvg = baseSvg({
  category: { text: "24/7 ECOMMERCE CARE & SPEED", width: 250 },
  titleRight: "Uptime: <tspan fill='#4ade80' font-weight='700'>99.99%</tspan> &#x2022; Active Watch",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">speed-guard.arwebcrafts.io/telemetry</text>

    <!-- Speed Telemetry Gauge Panel -->
    <g transform="translate(36, 60)">
      <rect width="310" height="180" rx="10" fill="#020a16" stroke="#255a9b" stroke-width="1"/>
      <text x="18" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Store TTFB &amp; Load Speed</text>
      <text x="18" y="70" font-family="sans-serif" font-size="38" font-weight="800" fill="#4ade80">0.42s</text>
      <text x="18" y="92" font-family="sans-serif" font-size="11" font-weight="600" fill="#F2D184">&#x26A1; Sub-second eCommerce load</text>
      <line x1="18" y1="110" x2="292" y2="110" stroke="#133156" stroke-width="1"/>
      <text x="18" y="132" font-family="sans-serif" font-size="11" fill="#cbd5e1">Redis Object Cache Hit Rate</text>
      <rect x="18" y="142" width="274" height="8" rx="4" fill="#1e293b"/>
      <rect x="18" y="142" width="262" height="8" rx="4" fill="#38bdf8"/>
      <text x="240" y="132" font-family="sans-serif" font-size="11" font-weight="700" fill="#38bdf8">96.4%</text>
    </g>

    <!-- Security & Uptime Panel -->
    <g transform="translate(366, 60)">
      <rect width="310" height="180" rx="10" fill="#020a16" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="18" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Security &amp; Threat Defense</text>
      <text x="18" y="70" font-family="sans-serif" font-size="38" font-weight="800" fill="#38bdf8">0</text>
      <text x="50" y="70" font-family="sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Vulnerabilities</text>
      <text x="18" y="92" font-family="sans-serif" font-size="11" font-weight="600" fill="#4ade80">&#x2713; Web Application Firewall Active</text>
      <line x1="18" y1="110" x2="292" y2="110" stroke="#133156" stroke-width="1"/>
      <text x="18" y="132" font-family="sans-serif" font-size="11" fill="#cbd5e1">Last Automated Cloud Backup</text>
      <text x="18" y="152" font-family="monospace" font-size="11" fill="#F2D184">Today, 04:00 AM (AWS S3 Encrypted)</text>
    </g>

    <!-- 4 Proactive Monitoring Features -->
    <g transform="translate(36, 260)">
      <rect width="640" height="105" rx="8" fill="#061c38" stroke="#1d487c" stroke-width="1"/>
      
      <g transform="translate(20, 20)">
        <circle cx="10" cy="10" r="8" fill="#4ade80" fill-opacity="0.2"/>
        <circle cx="10" cy="10" r="3" fill="#4ade80"/>
        <text x="26" y="14" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Plugin Conflict Prevention</text>
        <text x="26" y="30" font-family="sans-serif" font-size="10" fill="#94a3b8">Staging environment pre-testing</text>
      </g>

      <g transform="translate(340, 20)">
        <circle cx="10" cy="10" r="8" fill="#F2D184" fill-opacity="0.2"/>
        <circle cx="10" cy="10" r="3" fill="#F2D184"/>
        <text x="26" y="14" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Database Auto-Pruning</text>
        <text x="26" y="30" font-family="sans-serif" font-size="10" fill="#94a3b8">Transients &amp; expired sessions cleared</text>
      </g>

      <g transform="translate(20, 60)">
        <circle cx="10" cy="10" r="8" fill="#38bdf8" fill-opacity="0.2"/>
        <circle cx="10" cy="10" r="3" fill="#38bdf8"/>
        <text x="26" y="14" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Instant Incident Recovery</text>
        <text x="26" y="30" font-family="sans-serif" font-size="10" fill="#94a3b8">&lt; 15 min emergency turnaround</text>
      </g>

      <g transform="translate(340, 60)">
        <circle cx="10" cy="10" r="8" fill="#c084fc" fill-opacity="0.2"/>
        <circle cx="10" cy="10" r="3" fill="#c084fc"/>
        <text x="26" y="14" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Monthly Performance Reports</text>
        <text x="26" y="30" font-family="sans-serif" font-size="10" fill="#94a3b8">Transparent executive reporting</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'woocommerce-maintenance-speed.svg'), wooMaintSvg);

// 6. WooCommerce Order Tracking
const wooTrackingSvg = baseSvg({
  category: { text: "ORDER TRACKING & LOGISTICS", width: 240 },
  titleRight: "FedEx &#x2022; DHL &#x2022; UPS &#x2022; Multi-Carrier",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">track.arwebcrafts.com/parcel/AR-TRK-7891</text>

    <!-- Tracking Header Status Card -->
    <g transform="translate(36, 60)">
      <rect width="640" height="90" rx="10" fill="#020c1a" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="24" y="32" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Tracking Number: <tspan fill="#F2D184" font-family="monospace">AR-9812-4091-US</tspan></text>
      <text x="24" y="54" font-family="sans-serif" font-size="11" fill="#94a3b8">Carrier: DHL Express Worldwide &#x2022; Estimated Arrival: Today by 4:00 PM</text>
      <rect x="490" y="22" width="125" height="36" rx="6" fill="#064e3b"/>
      <text x="552" y="44" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#34d399">OUT FOR DELIVERY</text>
    </g>

    <!-- Visual Milestone Progress Bar -->
    <g transform="translate(56, 185)">
      <line x1="40" y1="20" x2="560" y2="20" stroke="#1e3a5f" stroke-width="4"/>
      <line x1="40" y1="20" x2="380" y2="20" stroke="#BE8C33" stroke-width="4"/>

      <!-- Node 1: Ordered -->
      <circle cx="40" cy="20" r="14" fill="#BE8C33"/>
      <text x="40" y="24" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">&#x2713;</text>
      <text x="40" y="50" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#FFFFFF">Order Placed</text>

      <!-- Node 2: Processed -->
      <circle cx="210" cy="20" r="14" fill="#BE8C33"/>
      <text x="210" y="24" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">&#x2713;</text>
      <text x="210" y="50" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#FFFFFF">Dispatched</text>

      <!-- Node 3: In Transit -->
      <circle cx="380" cy="20" r="14" fill="#BE8C33"/>
      <text x="380" y="24" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">&#x2713;</text>
      <text x="380" y="50" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">Out for Delivery</text>

      <!-- Node 4: Delivered -->
      <circle cx="560" cy="20" r="14" fill="#0c2340" stroke="#334155" stroke-width="2"/>
      <text x="560" y="50" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b">Delivered</text>
    </g>

    <!-- Automated Notification Features -->
    <g transform="translate(36, 275)">
      <rect width="640" height="90" rx="8" fill="#061c38" stroke="#1d487c" stroke-width="1"/>
      <g transform="translate(24, 20)">
        <text x="0" y="16" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">&#x1F4F1; Automated SMS &amp; WhatsApp Alerts</text>
        <text x="0" y="34" font-family="sans-serif" font-size="10" fill="#94a3b8">Instant status updates directly to customers</text>
      </g>
      <g transform="translate(340, 20)">
        <text x="0" y="16" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">&#x1F4CA; Branded Storefront Tracking Portal</text>
        <text x="0" y="34" font-family="sans-serif" font-size="10" fill="#94a3b8">Keep customers on your website, reducing tickets by 65%</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'woocommerce-order-tracking.svg'), wooTrackingSvg);

// 7. Plugin Maintenance & Security
const pluginMaintSvg = baseSvg({
  category: { text: "PLUGIN LIFECYCLE & SECURITY", width: 250 },
  titleRight: "PHP 8.1 - 8.3+ &#x2022; Zero CVEs",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">plugin-ci-cd.arwebcrafts.io/pipeline</text>

    <!-- Pipeline Step 1 -->
    <g transform="translate(36, 65)">
      <rect width="195" height="180" rx="10" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
      <circle cx="28" cy="28" r="12" fill="#38bdf8" fill-opacity="0.2"/>
      <text x="24" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#38bdf8">01</text>
      <text x="50" y="32" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Static Analysis</text>
      <line x1="16" y1="52" x2="179" y2="52" stroke="#133156" stroke-width="1"/>
      <text x="16" y="74" font-family="sans-serif" font-size="11" fill="#94a3b8">PHPStan Level 8: Passed</text>
      <text x="16" y="96" font-family="sans-serif" font-size="11" fill="#94a3b8">WPCS Standards: 100%</text>
      <text x="16" y="118" font-family="sans-serif" font-size="11" fill="#94a3b8">Security Audit: Clean</text>
      <rect x="16" y="136" width="163" height="28" rx="4" fill="#064e3b"/>
      <text x="97" y="154" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">&#x2713; ZERO VULNERABILITIES</text>
    </g>

    <!-- Pipeline Step 2 -->
    <g transform="translate(258, 65)">
      <rect width="195" height="180" rx="10" fill="#020e1e" stroke="#BE8C33" stroke-width="1.2"/>
      <circle cx="28" cy="28" r="12" fill="#BE8C33" fill-opacity="0.2"/>
      <text x="24" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">02</text>
      <text x="50" y="32" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Unit Testing</text>
      <line x1="16" y1="52" x2="179" y2="52" stroke="#133156" stroke-width="1"/>
      <text x="16" y="74" font-family="sans-serif" font-size="11" fill="#94a3b8">PHPUnit Tests: 248</text>
      <text x="16" y="96" font-family="sans-serif" font-size="11" fill="#94a3b8">Code Coverage: 94.2%</text>
      <text x="16" y="118" font-family="sans-serif" font-size="11" fill="#94a3b8">WP 6.7 Compatibility</text>
      <rect x="16" y="136" width="163" height="28" rx="4" fill="#042a1f"/>
      <text x="97" y="154" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#4ade80">&#x2713; ALL 248 PASSING</text>
    </g>

    <!-- Pipeline Step 3 -->
    <g transform="translate(480, 65)">
      <rect width="195" height="180" rx="10" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
      <circle cx="28" cy="28" r="12" fill="#c084fc" fill-opacity="0.2"/>
      <text x="24" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#c084fc">03</text>
      <text x="50" y="32" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Release Deployment</text>
      <line x1="16" y1="52" x2="179" y2="52" stroke="#133156" stroke-width="1"/>
      <text x="16" y="74" font-family="sans-serif" font-size="11" fill="#94a3b8">Semantic Version: v3.4.0</text>
      <text x="16" y="96" font-family="sans-serif" font-size="11" fill="#94a3b8">Auto-Update Server: OK</text>
      <text x="16" y="118" font-family="sans-serif" font-size="11" fill="#94a3b8">Rollback Point: Ready</text>
      <rect x="16" y="136" width="163" height="28" rx="4" fill="#1e293b"/>
      <text x="97" y="154" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">&#x26A1; LIVE ON WP.ORG</text>
    </g>

    <!-- Maintenance Guarantee Banner -->
    <g transform="translate(36, 270)">
      <rect width="640" height="95" rx="8" fill="#082245" stroke="#1e4b85" stroke-width="1"/>
      <text x="24" y="34" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">&#x1F6E1; Independent Commercial Plugin Stewardship</text>
      <text x="24" y="56" font-family="sans-serif" font-size="11" fill="#cbd5e1">We maintain, update, and secure commercial WordPress plugins for global creators with 100% hands-off peace of mind.</text>
      <rect x="500" y="24" width="116" height="34" rx="6" fill="#BE8C33"/>
      <text x="558" y="45" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#011B39">ACTIVE CARE</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'plugin-maintenance-security.svg'), pluginMaintSvg);

// 8. WordPress Site Care Maintenance
const wpSiteMaintSvg = baseSvg({
  category: { text: "WORDPRESS SITE MAINTENANCE", width: 250 },
  titleRight: "Daily S3 Backups &#x2022; Instant Uptime",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">health.arwebcrafts.com/site-audit</text>

    <!-- Health Score Visual Gauge (Left) -->
    <g transform="translate(36, 65)">
      <rect width="250" height="200" rx="10" fill="#020b18" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Overall Site Health</text>
      
      <!-- Big Percentage -->
      <circle cx="125" cy="110" r="55" fill="none" stroke="#1e293b" stroke-width="10"/>
      <circle cx="125" cy="110" r="55" fill="none" stroke="#4ade80" stroke-width="10" stroke-dasharray="320, 345"/>
      <text x="125" y="115" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="800" fill="#4ade80">100%</text>
      <text x="125" y="132" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#94a3b8">EXCELLENT</text>
      
      <text x="125" y="185" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">&#x2713; All 0 Issues Resolved</text>
    </g>

    <!-- Status Columns (Right) -->
    <g transform="translate(310, 65)">
      <!-- Item 1 -->
      <g transform="translate(0, 0)">
        <rect width="365" height="42" rx="6" fill="#071e3d" stroke="#1c477d" stroke-width="1"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Automated Daily Cloud Backups</text>
        <text x="280" y="25" font-family="monospace" font-size="10" fill="#94a3b8">AWS S3 Sync</text>
      </g>
      <!-- Item 2 -->
      <g transform="translate(0, 52)">
        <rect width="365" height="42" rx="6" fill="#071e3d" stroke="#1c477d" stroke-width="1"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Real-time Malware &amp; Firewall Scan</text>
        <text x="280" y="25" font-family="monospace" font-size="10" fill="#4ade80">Clean (0 CVE)</text>
      </g>
      <!-- Item 3 -->
      <g transform="translate(0, 104)">
        <rect width="365" height="42" rx="6" fill="#071e3d" stroke="#1c477d" stroke-width="1"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Core, Plugin &amp; Theme Updates</text>
        <text x="280" y="25" font-family="monospace" font-size="10" fill="#F2D184">Staging Tested</text>
      </g>
      <!-- Item 4 -->
      <g transform="translate(0, 156)">
        <rect width="365" height="42" rx="6" fill="#071e3d" stroke="#1c477d" stroke-width="1"/>
        <circle cx="20" cy="21" r="5" fill="#4ade80"/>
        <text x="36" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">24/7 Server Uptime Monitoring</text>
        <text x="280" y="25" font-family="monospace" font-size="10" fill="#38bdf8">99.98% Monitored</text>
      </g>
    </g>

    <!-- Bottom Action Pill -->
    <g transform="translate(36, 290)">
      <rect width="640" height="75" rx="8" fill="#020e1e" stroke="#1b3f6e" stroke-width="1"/>
      <text x="24" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">&#x26A1; Zero Downtime Guarantee</text>
      <text x="24" y="48" font-family="sans-serif" font-size="11" fill="#94a3b8">Sleep peacefully while our senior WordPress engineers protect and maintain your mission-critical site.</text>
      <rect x="510" y="20" width="105" height="34" rx="6" fill="#BE8C33"/>
      <text x="562" y="42" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#011B39">PROTECTED</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'wordpress-site-care-maintenance.svg'), wpSiteMaintSvg);

// 9. WordPress Theme Development
const themeDevSvg = baseSvg({
  category: { text: "WORDPRESS THEME ENGINEERING", width: 260 },
  titleRight: "Full Site Editing &#x2022; Gutenberg Blocks",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">theme-builder.arwebcrafts.com/theme.json</text>

    <!-- Theme Editor Visual (Left) -->
    <g transform="translate(36, 60)">
      <rect width="360" height="300" rx="10" fill="#020914" stroke="#255a9b" stroke-width="1"/>
      <rect width="360" height="34" rx="10" fill="#072040"/>
      <text x="16" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Gutenberg Component Blocks</text>
      
      <!-- Block 1 -->
      <g transform="translate(16, 48)">
        <rect width="328" height="52" rx="6" fill="#092244" stroke="#BE8C33" stroke-width="1"/>
        <rect x="12" y="10" width="32" height="32" rx="4" fill="#BE8C33"/>
        <text x="28" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" fill="#011B39">H1</text>
        <text x="56" y="26" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Dynamic Hero Banner Block</text>
        <text x="56" y="40" font-family="sans-serif" font-size="10" fill="#94a3b8">Server-side rendered &#x2022; Zero CSS bloat</text>
      </g>

      <!-- Block 2 -->
      <g transform="translate(16, 110)">
        <rect width="328" height="52" rx="6" fill="#092244" stroke="#1d487c" stroke-width="1"/>
        <rect x="12" y="10" width="32" height="32" rx="4" fill="#38bdf8"/>
        <text x="28" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" fill="#011B39">&lt;&gt;</text>
        <text x="56" y="26" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Interactive Filter Grid Block</text>
        <text x="56" y="40" font-family="sans-serif" font-size="10" fill="#94a3b8">React + Gutenberg Native Attributes</text>
      </g>

      <!-- Block 3 -->
      <g transform="translate(16, 172)">
        <rect width="328" height="52" rx="6" fill="#092244" stroke="#1d487c" stroke-width="1"/>
        <rect x="12" y="10" width="32" height="32" rx="4" fill="#4ade80"/>
        <text x="28" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" fill="#011B39">&#x2605;</text>
        <text x="56" y="26" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Testimonial &amp; Case Study Carousel</text>
        <text x="56" y="40" font-family="sans-serif" font-size="10" fill="#94a3b8">Vanilla JS &#x2022; 0 external libraries</text>
      </g>

      <!-- Status Footer -->
      <g transform="translate(16, 240)">
        <rect width="328" height="42" rx="6" fill="#05162e"/>
        <text x="14" y="26" font-family="sans-serif" font-size="11" font-weight="700" fill="#4ade80">&#x2713; Fully Compliant with WP 6.7 FSE Engine</text>
      </g>
    </g>

    <!-- Theme Specs Card (Right) -->
    <g transform="translate(416, 60)">
      <rect width="260" height="300" rx="10" fill="#020914" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="20" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Theme Performance Specs</text>

      <g transform="translate(20, 50)">
        <text x="0" y="14" font-family="sans-serif" font-size="11" fill="#94a3b8">Asset Payload Size</text>
        <text x="0" y="36" font-family="sans-serif" font-size="20" font-weight="800" fill="#4ade80">&lt; 45 KB total</text>
      </g>

      <g transform="translate(20, 110)">
        <text x="0" y="14" font-family="sans-serif" font-size="11" fill="#94a3b8">Core Web Vitals</text>
        <text x="0" y="36" font-family="sans-serif" font-size="20" font-weight="800" fill="#F2D184">100 / 100 Score</text>
      </g>

      <g transform="translate(20, 170)">
        <text x="0" y="14" font-family="sans-serif" font-size="11" fill="#94a3b8">Theme Architecture</text>
        <text x="0" y="34" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">JSON Theme Config</text>
        <text x="0" y="50" font-family="sans-serif" font-size="11" fill="#38bdf8">Custom Design Tokens</text>
      </g>

      <rect x="20" y="240" width="220" height="38" rx="6" fill="#BE8C33"/>
      <text x="130" y="264" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#011B39">BESPOKE ARCHITECTURE</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'wordpress-theme-development.svg'), themeDevSvg);

// 10. Workflow Automation Engine
const workflowSvg = baseSvg({
  category: { text: "WORKFLOW AUTOMATION & ZAPIER", width: 260 },
  titleRight: "Tasks Saved: <tspan fill='#4ade80' font-weight='700'>14,200/mo</tspan>",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">workflow-builder.arwebcrafts.io/pipeline/auto_409</text>

    <!-- Node-based Visual Editor -->
    <!-- Trigger Node (1) -->
    <g transform="translate(36, 65)">
      <rect width="180" height="95" rx="8" fill="#082245" stroke="#38bdf8" stroke-width="1.5"/>
      <circle cx="20" cy="24" r="8" fill="#38bdf8"/>
      <text x="36" y="28" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">TRIGGER: Form Submission</text>
      <text x="16" y="52" font-family="sans-serif" font-size="10" fill="#cbd5e1">Customer fills consultation quote</text>
      <text x="16" y="74" font-family="monospace" font-size="9" fill="#38bdf8">Payload: {name, budget, svc}</text>
      <!-- Output Port -->
      <circle cx="180" cy="48" r="5" fill="#BE8C33"/>
    </g>

    <!-- Connecting Arrow 1 -->
    <line x1="216" y1="113" x2="266" y2="113" stroke="#BE8C33" stroke-width="2" stroke-dasharray="3,3"/>

    <!-- Logic / Filter Node (2) -->
    <g transform="translate(266, 65)">
      <rect width="180" height="95" rx="8" fill="#082245" stroke="#BE8C33" stroke-width="1.5"/>
      <circle cx="20" cy="24" r="8" fill="#BE8C33"/>
      <text x="36" y="28" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">LOGIC: Filter &amp; Enrich</text>
      <text x="16" y="52" font-family="sans-serif" font-size="10" fill="#cbd5e1">AI Lead Scoring &gt; 80</text>
      <text x="16" y="74" font-family="monospace" font-size="9" fill="#F2D184">Status: QUALIFIED LEAD</text>
      <!-- Output Port -->
      <circle cx="180" cy="48" r="5" fill="#BE8C33"/>
    </g>

    <!-- Connecting Arrow 2 -->
    <line x1="446" y1="113" x2="496" y2="113" stroke="#BE8C33" stroke-width="2" stroke-dasharray="3,3"/>

    <!-- Action Node (3) -->
    <g transform="translate(496, 65)">
      <rect width="180" height="95" rx="8" fill="#082245" stroke="#4ade80" stroke-width="1.5"/>
      <circle cx="20" cy="24" r="8" fill="#4ade80"/>
      <text x="36" y="28" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">ACTION: CRM &amp; Slack</text>
      <text x="16" y="52" font-family="sans-serif" font-size="10" fill="#cbd5e1">Create Deal in HubSpot</text>
      <text x="16" y="74" font-family="monospace" font-size="9" fill="#4ade80">Alert Engineering Channel</text>
    </g>

    <!-- Lower Automated Tasks Panel -->
    <g transform="translate(36, 190)">
      <rect width="640" height="175" rx="10" fill="#020914" stroke="#163866" stroke-width="1"/>
      <text x="20" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Active Automated Pipelines</text>

      <g transform="translate(20, 42)">
        <rect width="600" height="34" rx="4" fill="#071b36"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" fill="#FFFFFF">eCommerce Order &rarr; Multi-Warehouse Shipping Notification</text>
        <text x="460" y="22" font-family="monospace" font-size="10" fill="#4ade80">Execution: 0.18s</text>
        <circle cx="580" cy="17" r="4" fill="#4ade80"/>
      </g>

      <g transform="translate(20, 84)">
        <rect width="600" height="34" rx="4" fill="#071b36"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" fill="#FFFFFF">WooCommerce Subscriptions &rarr; Automated Invoice PDF &amp; Accounting Sync</text>
        <text x="460" y="22" font-family="monospace" font-size="10" fill="#4ade80">Execution: 0.25s</text>
        <circle cx="580" cy="17" r="4" fill="#4ade80"/>
      </g>

      <g transform="translate(20, 126)">
        <rect width="600" height="34" rx="4" fill="#071b36"/>
        <text x="14" y="22" font-family="sans-serif" font-size="11" fill="#FFFFFF">LearnDash Course Completion &rarr; Digital Badge Issued &amp; CRM Tagged</text>
        <text x="460" y="22" font-family="monospace" font-size="10" fill="#4ade80">Execution: 0.12s</text>
        <circle cx="580" cy="17" r="4" fill="#4ade80"/>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'workflow-automation-engine.svg'), workflowSvg);

// 11. Portfolio Hero Showcase
const portfolioHeroSvg = baseSvg({
  width: 800,
  height: 600,
  category: { text: "FLAGSHIP CLIENT PORTFOLIO", width: 240 },
  titleRight: "Global Implementations &#x2022; 100% Custom",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="460" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">portfolio-showcase.arwebcrafts.com</text>

    <!-- Main Central Multi-Display Visual -->
    <!-- Large Desktop Mockup -->
    <g transform="translate(40, 65)">
      <rect width="400" height="250" rx="8" fill="#020c1a" stroke="#BE8C33" stroke-width="1.5"/>
      <rect width="400" height="28" rx="8" fill="#072242"/>
      <text x="16" y="18" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Enterprise SaaS &amp; eCommerce Platform</text>
      <!-- Hero inside screen -->
      <rect x="20" y="44" width="220" height="20" rx="4" fill="#BE8C33"/>
      <rect x="20" y="72" width="160" height="8" rx="2" fill="#475569"/>
      <rect x="20" y="86" width="180" height="8" rx="2" fill="#334155"/>
      <!-- Grid items inside screen -->
      <rect x="20" y="110" width="115" height="110" rx="6" fill="#0b2447" stroke="#1e4b85" stroke-width="1"/>
      <rect x="145" y="110" width="115" height="110" rx="6" fill="#0b2447" stroke="#1e4b85" stroke-width="1"/>
      <rect x="270" y="110" width="110" height="110" rx="6" fill="#0b2447" stroke="#1e4b85" stroke-width="1"/>
    </g>

    <!-- Mobile Device Mockup Overlay (Right) -->
    <g transform="translate(470, 75)">
      <rect width="200" height="340" rx="18" fill="#010a16" stroke="#F2D184" stroke-width="2"/>
      <rect x="75" y="10" width="50" height="6" rx="3" fill="#1e293b"/>
      <rect x="18" y="32" width="164" height="20" rx="4" fill="#BE8C33"/>
      <rect x="18" y="60" width="164" height="70" rx="6" fill="#0b2447"/>
      <rect x="18" y="140" width="164" height="60" rx="6" fill="#071b36"/>
      <rect x="18" y="210" width="164" height="60" rx="6" fill="#071b36"/>
      <circle cx="100" cy="310" r="10" fill="#1e293b"/>
    </g>

    <!-- Floating Statistics Pill (Bottom Left) -->
    <g transform="translate(40, 340)">
      <rect width="400" height="75" rx="10" fill="#061f3e" stroke="#1d487c" stroke-width="1"/>
      <g transform="translate(20, 20)">
        <text x="0" y="14" font-family="sans-serif" font-size="18" font-weight="800" fill="#4ade80">500+</text>
        <text x="0" y="32" font-family="sans-serif" font-size="10" fill="#94a3b8">Projects Shipped</text>
      </g>
      <g transform="translate(140, 20)">
        <text x="0" y="14" font-family="sans-serif" font-size="18" font-weight="800" fill="#F2D184">99.8%</text>
        <text x="0" y="32" font-family="sans-serif" font-size="10" fill="#94a3b8">Client Satisfaction</text>
      </g>
      <g transform="translate(260, 20)">
        <text x="0" y="14" font-family="sans-serif" font-size="18" font-weight="800" fill="#38bdf8">15+ Nations</text>
        <text x="0" y="32" font-family="sans-serif" font-size="10" fill="#94a3b8">US, UK, UAE &amp; Global</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'portfolio-hero-showcase.svg'), portfolioHeroSvg);

// 12. Portfolio Card 7: CF7 WOW Styler
const cf7StylerSvg = baseSvg({
  width: 600,
  height: 400,
  category: { text: "WORDPRESS PLUGIN", width: 170 },
  titleRight: "Visual Form Customizer",
  children: `
  <g transform="translate(30, 80)">
    <rect width="540" height="290" rx="12" fill="#041427" stroke="#BE8C33" stroke-width="1.5"/>
    <rect width="540" height="34" rx="12" fill="#030e1d"/>
    <circle cx="18" cy="17" r="4.5" fill="#f87171"/>
    <circle cx="32" cy="17" r="4.5" fill="#fbbf24"/>
    <circle cx="46" cy="17" r="4.5" fill="#34d399"/>
    <text x="65" y="21" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">CF7 WOW Styler &#x2014; Live Visual Editor</text>

    <!-- Left Controls Panel -->
    <g transform="translate(18, 50)">
      <rect width="180" height="215" rx="8" fill="#020b18" stroke="#1e3a5f" stroke-width="1"/>
      <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Style Controls</text>
      <text x="14" y="52" font-family="sans-serif" font-size="10" fill="#94a3b8">Primary Color</text>
      <rect x="14" y="60" width="150" height="22" rx="4" fill="#BE8C33"/>
      <text x="14" y="104" font-family="sans-serif" font-size="10" fill="#94a3b8">Border Radius: 8px</text>
      <rect x="14" y="112" width="150" height="6" rx="3" fill="#1e293b"/>
      <rect x="14" y="112" width="90" height="6" rx="3" fill="#F2D184"/>
      <text x="14" y="142" font-family="sans-serif" font-size="10" fill="#94a3b8">Typography: Inter Bold</text>
      <rect x="14" y="165" width="150" height="28" rx="4" fill="#064e3b"/>
      <text x="89" y="183" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">&#x2713; LIVE APPLIED</text>
    </g>

    <!-- Right Live Form Preview -->
    <g transform="translate(216, 50)">
      <rect width="305" height="215" rx="8" fill="#010a17" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="18" y="26" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Get in Touch With Us</text>
      <!-- Form Input 1 -->
      <rect x="18" y="42" width="268" height="34" rx="6" fill="#081e3a" stroke="#1c477d" stroke-width="1"/>
      <text x="30" y="63" font-family="sans-serif" font-size="10" fill="#94a3b8">Your Name</text>
      <!-- Form Input 2 -->
      <rect x="18" y="86" width="268" height="34" rx="6" fill="#081e3a" stroke="#1c477d" stroke-width="1"/>
      <text x="30" y="107" font-family="sans-serif" font-size="10" fill="#94a3b8">Your Email Address</text>
      <!-- Form Input 3 (Textarea) -->
      <rect x="18" y="130" width="268" height="38" rx="6" fill="#081e3a" stroke="#1c477d" stroke-width="1"/>
      <text x="30" y="152" font-family="sans-serif" font-size="10" fill="#94a3b8">Project Details...</text>
      <!-- Styled Submit Button -->
      <rect x="18" y="178" width="268" height="28" rx="6" fill="#BE8C33"/>
      <text x="152" y="196" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" fill="#011B39">SUBMIT INQUIRY &rarr;</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'portfolio-cf7-wow-styler.svg'), cf7StylerSvg);

// 13. Portfolio Card 8: WebinarIgnition
const webinarSvg = baseSvg({
  width: 600,
  height: 400,
  category: { text: "WEBINAR ENGINE", width: 160 },
  titleRight: "Live Streaming & Funnels",
  children: `
  <g transform="translate(30, 80)">
    <rect width="540" height="290" rx="12" fill="#041427" stroke="#BE8C33" stroke-width="1.5"/>
    <rect width="540" height="34" rx="12" fill="#030e1d"/>
    <circle cx="18" cy="17" r="4.5" fill="#f87171"/>
    <circle cx="32" cy="17" r="4.5" fill="#fbbf24"/>
    <circle cx="46" cy="17" r="4.5" fill="#34d399"/>
    <text x="65" y="21" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">WebinarIgnition &#x2014; Interactive Live Suite</text>

    <!-- Main Stream Player (Left) -->
    <g transform="translate(18, 48)">
      <rect width="320" height="215" rx="8" fill="#000000" stroke="#1d487c" stroke-width="1"/>
      <!-- Video Frame Center -->
      <circle cx="160" cy="95" r="26" fill="#BE8C33" fill-opacity="0.9"/>
      <polygon points="154,82 172,95 154,108" fill="#011B39"/>
      <text x="160" y="140" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">LIVE BROADCAST: High-Ticket Scaling</text>
      <!-- Live Indicator -->
      <rect x="14" y="14" width="56" height="20" rx="4" fill="#dc2626"/>
      <circle cx="24" cy="24" r="3" fill="#FFFFFF"/>
      <text x="32" y="28" font-family="sans-serif" font-size="9" font-weight="800" fill="#FFFFFF">LIVE</text>
      <!-- Viewer Count -->
      <rect x="230" y="14" width="76" height="20" rx="4" fill="#1e293b"/>
      <text x="238" y="28" font-family="sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">&#x1F441; 2,410 viewers</text>
      <!-- Bottom Control Bar -->
      <rect y="180" width="320" height="35" rx="0" fill="#0a192f"/>
      <text x="16" y="202" font-family="sans-serif" font-size="10" fill="#4ade80">&#x26A1; 0 Buffer Latency | 1080p 60fps</text>
    </g>

    <!-- Live Chat & CTA Sidebar (Right) -->
    <g transform="translate(352, 48)">
      <rect width="170" height="215" rx="8" fill="#020b18" stroke="#BE8C33" stroke-width="1"/>
      <rect width="170" height="28" rx="8" fill="#072040"/>
      <text x="12" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">Live Attendee Chat</text>
      
      <g transform="translate(10, 38)">
        <text x="0" y="12" font-family="sans-serif" font-size="9" font-weight="700" fill="#F2D184">Sarah M.:</text>
        <text x="0" y="24" font-family="sans-serif" font-size="8.5" fill="#cbd5e1">The custom plugin saved us!</text>
      </g>
      <g transform="translate(10, 72)">
        <text x="0" y="12" font-family="sans-serif" font-size="9" font-weight="700" fill="#38bdf8">David K.:</text>
        <text x="0" y="24" font-family="sans-serif" font-size="8.5" fill="#cbd5e1">Incredible checkout speed!</text>
      </g>
      
      <!-- Instant In-Stream CTA Button -->
      <rect x="10" y="160" width="150" height="42" rx="6" fill="#BE8C33"/>
      <text x="85" y="178" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">CLAIM SPECIAL OFFER</text>
      <text x="85" y="192" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="#011B39">Expires in 08:34</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'portfolio-webinar-ignition.svg'), webinarSvg);

// 14. Portfolio Card 9: 5 Stars Rating Funnel
const fiveStarSvg = baseSvg({
  width: 600,
  height: 400,
  category: { text: "REPUTATION ENGINE", width: 180 },
  titleRight: "Google & Trustpilot Booster",
  children: `
  <g transform="translate(30, 80)">
    <rect width="540" height="290" rx="12" fill="#041427" stroke="#BE8C33" stroke-width="1.5"/>
    <rect width="540" height="34" rx="12" fill="#030e1d"/>
    <circle cx="18" cy="17" r="4.5" fill="#f87171"/>
    <circle cx="32" cy="17" r="4.5" fill="#fbbf24"/>
    <circle cx="46" cy="17" r="4.5" fill="#34d399"/>
    <text x="65" y="21" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">5 Stars Rating Funnel &#x2014; Reputation Booster</text>

    <!-- Central Funnel Logic Interface -->
    <g transform="translate(40, 50)">
      <rect width="460" height="215" rx="10" fill="#020b18" stroke="#1e3a5f" stroke-width="1"/>
      <text x="230" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">How was your experience with us?</text>
      
      <!-- 5 Glowing Stars -->
      <g transform="translate(130, 48)">
        <polygon points="15,2 19,10 28,11 22,17 24,26 15,21 6,26 8,17 2,11 11,10" fill="#BE8C33"/>
        <polygon points="45,2 49,10 58,11 52,17 54,26 45,21 36,26 38,17 32,11 41,10" fill="#BE8C33"/>
        <polygon points="75,2 79,10 88,11 82,17 84,26 75,21 66,26 68,17 62,11 71,10" fill="#BE8C33"/>
        <polygon points="105,2 109,10 118,11 112,17 114,26 105,21 96,26 98,17 92,11 101,10" fill="#BE8C33"/>
        <polygon points="135,2 139,10 148,11 142,17 144,26 135,21 126,26 128,17 122,11 131,10" fill="#BE8C33"/>
      </g>

      <!-- Smart Routing Branch Visual -->
      <!-- High Rating Route (4-5 Stars) -->
      <g transform="translate(20, 100)">
        <rect width="200" height="90" rx="8" fill="#042a1f" stroke="#10b981" stroke-width="1.2"/>
        <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#34d399">&#x2713; 4-5 Stars Route</text>
        <text x="14" y="44" font-family="sans-serif" font-size="9.5" fill="#cbd5e1">Redirects directly to public profiles:</text>
        <rect x="14" y="56" width="80" height="22" rx="4" fill="#1e293b"/>
        <text x="24" y="71" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Google &#x2605;</text>
        <rect x="100" y="56" width="86" height="22" rx="4" fill="#00b67a"/>
        <text x="108" y="71" font-family="sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Trustpilot &#x2605;</text>
      </g>

      <!-- Low Rating Route (1-3 Stars) -->
      <g transform="translate(240, 100)">
        <rect width="200" height="90" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.2"/>
        <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#a5b4fc">&#x1F512; 1-3 Stars Route</text>
        <text x="14" y="44" font-family="sans-serif" font-size="9.5" fill="#cbd5e1">Kept private for internal resolution:</text>
        <rect x="14" y="56" width="172" height="22" rx="4" fill="#312e81"/>
        <text x="22" y="71" font-family="sans-serif" font-size="9" font-weight="700" fill="#c7d2fe">Private Feedback Ticket Sent</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'portfolio-five-star-funnel.svg'), fiveStarSvg);

// 15. Free Quote Consultation
const freeQuoteSvg = baseSvg({
  category: { text: "FREE PROJECT CONSULTATION", width: 260 },
  titleRight: "Senior Architecture Team",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#BE8C33" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">proposal-engine.arwebcrafts.com/estimate</text>

    <g transform="translate(36, 65)">
      <rect width="640" height="295" rx="10" fill="#020b18" stroke="#1d487c" stroke-width="1"/>
      <text x="24" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Transparent Scope, Timeline &amp; Cost Blueprint</text>
      <text x="24" y="52" font-family="sans-serif" font-size="11" fill="#94a3b8">No vague hourly billing. Fixed milestones with commercial delivery SLA.</text>
      
      <g transform="translate(24, 75)">
        <rect width="180" height="110" rx="8" fill="#071e3d"/>
        <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">1. Discovery Call</text>
        <text x="16" y="48" font-family="sans-serif" font-size="10" fill="#cbd5e1">Analyze requirements &amp; tech bottlenecks</text>
        <text x="16" y="80" font-family="sans-serif" font-size="10" font-weight="700" fill="#4ade80">&#x2713; FREE 30-MIN SESSION</text>
      </g>

      <g transform="translate(230, 75)">
        <rect width="180" height="110" rx="8" fill="#071e3d"/>
        <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">2. Architecture Plan</text>
        <text x="16" y="48" font-family="sans-serif" font-size="10" fill="#cbd5e1">Detailed database &amp; plugin specification</text>
        <text x="16" y="80" font-family="sans-serif" font-size="10" font-weight="700" fill="#38bdf8">&#x2713; FIXED-PRICE SCOPE</text>
      </g>

      <g transform="translate(436, 75)">
        <rect width="180" height="110" rx="8" fill="#071e3d"/>
        <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#F2D184">3. Agile Sprints</text>
        <text x="16" y="48" font-family="sans-serif" font-size="10" fill="#cbd5e1">Rapid execution with live staging reviews</text>
        <text x="16" y="80" font-family="sans-serif" font-size="10" font-weight="700" fill="#BE8C33">&#x2713; 100% IP OWNERSHIP</text>
      </g>

      <!-- Bottom Trust Ribbon -->
      <g transform="translate(24, 215)">
        <rect width="592" height="55" rx="6" fill="#0b2447" stroke="#BE8C33" stroke-width="1"/>
        <text x="20" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">&#x1F91D; Direct Senior Engineer Access</text>
        <text x="240" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">&#x26A1; Same-Day NDA Available</text>
        <text x="440" y="32" font-family="sans-serif" font-size="11" font-weight="700" fill="#4ade80">&#x1F6E1; 100% Satisfaction</text>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'free-quote-consultation.svg'), freeQuoteSvg);

// 16. LearnDash Addons Ecosystem
const learndashAddonsSvg = baseSvg({
  category: { text: "LEARNDASH ADD-ONS SUITE", width: 250 },
  titleRight: "Official Addon Ecosystem",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">addons.arwebcrafts.com/learndash</text>

    <!-- Addon 1: Certificate Verify -->
    <g transform="translate(36, 65)">
      <rect width="195" height="190" rx="10" fill="#020e1e" stroke="#BE8C33" stroke-width="1.2"/>
      <rect width="195" height="34" rx="10" fill="#072242"/>
      <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">Certificate Verify &amp; Share</text>
      <text x="14" y="58" font-family="sans-serif" font-size="10" fill="#cbd5e1">Enables students to verify &amp; share credentials on LinkedIn &amp; X with 1 click.</text>
      <rect x="14" y="140" width="167" height="30" rx="4" fill="#BE8C33"/>
      <text x="97" y="160" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="800" fill="#011B39">COMMERCIAL READY</text>
    </g>

    <!-- Addon 2: Progress Reset -->
    <g transform="translate(258, 65)">
      <rect width="195" height="190" rx="10" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
      <rect width="195" height="34" rx="10" fill="#072242"/>
      <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">Course Progress Reset</text>
      <text x="14" y="58" font-family="sans-serif" font-size="10" fill="#cbd5e1">Allow students or group leaders to reset attempts, quizzes, and progression.</text>
      <rect x="14" y="140" width="167" height="30" rx="4" fill="#044e35"/>
      <text x="97" y="160" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">ACTIVE ADDON</text>
    </g>

    <!-- Addon 3: Retake Quiz -->
    <g transform="translate(480, 65)">
      <rect width="195" height="190" rx="10" fill="#020e1e" stroke="#255a9b" stroke-width="1"/>
      <rect width="195" height="34" rx="10" fill="#072242"/>
      <text x="14" y="22" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">LearnDash Retake Quiz</text>
      <text x="14" y="58" font-family="sans-serif" font-size="10" fill="#cbd5e1">Timed quiz attempts, passing score controls, and individual question locks.</text>
      <rect x="14" y="140" width="167" height="30" rx="4" fill="#044e35"/>
      <text x="97" y="160" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">ACTIVE ADDON</text>
    </g>

    <g transform="translate(36, 280)">
      <rect width="640" height="85" rx="8" fill="#061c38" stroke="#1d487c" stroke-width="1"/>
      <text x="24" y="32" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Tailor-Made Extensions for Corporate &amp; Educational LMS Platforms</text>
      <text x="24" y="52" font-family="sans-serif" font-size="11" fill="#94a3b8">We solve the exact functional gaps standard LearnDash plugins leave behind.</text>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'learndash-addons-ecosystem.svg'), learndashAddonsSvg);

// 17. AI Automation & Agents
const aiAutomationSvg = baseSvg({
  category: { text: "AI & INTELLIGENT AGENTS", width: 240 },
  titleRight: "LLM Orchestration &#x2022; Vector DB",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">ai-engine.arwebcrafts.io/neural</text>

    <!-- AI Agent Pipeline Graph -->
    <g transform="translate(36, 65)">
      <rect width="640" height="295" rx="10" fill="#020b18" stroke="#BE8C33" stroke-width="1.2"/>
      <text x="24" y="30" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Autonomous AI Workflow Architecture</text>
      
      <!-- Box 1: User / Trigger Query -->
      <g transform="translate(24, 55)">
        <rect width="170" height="85" rx="8" fill="#071e3d" stroke="#38bdf8" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">1. User / Webhook Event</text>
        <text x="14" y="44" font-family="sans-serif" font-size="10" fill="#cbd5e1">Customer support or business transaction query</text>
      </g>

      <!-- Arrow 1 -->
      <line x1="194" y1="97" x2="234" y2="97" stroke="#BE8C33" stroke-width="2"/>

      <!-- Box 2: RAG & Vector Memory -->
      <g transform="translate(234, 55)">
        <rect width="170" height="85" rx="8" fill="#071e3d" stroke="#BE8C33" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">2. Vector Embeddings</text>
        <text x="14" y="44" font-family="sans-serif" font-size="10" fill="#cbd5e1">Instant semantic lookup across your proprietary docs</text>
      </g>

      <!-- Arrow 2 -->
      <line x1="404" y1="97" x2="444" y2="97" stroke="#BE8C33" stroke-width="2"/>

      <!-- Box 3: LLM Agent Execution -->
      <g transform="translate(444, 55)">
        <rect width="170" height="85" rx="8" fill="#071e3d" stroke="#4ade80" stroke-width="1"/>
        <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">3. Autonomous Action</text>
        <text x="14" y="44" font-family="sans-serif" font-size="10" fill="#cbd5e1">Updates CRM, dispatches email, resolves issue</text>
      </g>

      <!-- Metrics Panel Bottom -->
      <g transform="translate(24, 165)">
        <rect width="592" height="105" rx="8" fill="#041224" stroke="#1d487c" stroke-width="1"/>
        <g transform="translate(24, 25)">
          <text x="0" y="16" font-family="sans-serif" font-size="20" font-weight="800" fill="#4ade80">0.24s</text>
          <text x="0" y="34" font-family="sans-serif" font-size="10" fill="#94a3b8">Avg Decision Time</text>
        </g>
        <g transform="translate(180, 25)">
          <text x="0" y="16" font-family="sans-serif" font-size="20" font-weight="800" fill="#F2D184">99.4%</text>
          <text x="0" y="34" font-family="sans-serif" font-size="10" fill="#94a3b8">Execution Accuracy</text>
        </g>
        <g transform="translate(360, 25)">
          <text x="0" y="16" font-family="sans-serif" font-size="20" font-weight="800" fill="#38bdf8">24/7 Autonomy</text>
          <text x="0" y="34" font-family="sans-serif" font-size="10" fill="#94a3b8">Zero Human Overhead</text>
        </g>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'ai-automation-agents.svg'), aiAutomationSvg);

// 18. Hire Dedicated Senior Developer
const hireDevSvg = baseSvg({
  category: { text: "DEDICATED FULL-STACK TALENT", width: 260 },
  titleRight: "Senior WordPress & SaaS Engineers",
  children: `
  <g transform="translate(44, 90)">
    <rect width="712" height="390" rx="14" fill="#041427" stroke="#1d487c" stroke-width="1.5"/>
    <rect width="712" height="42" rx="14" fill="#030e1d"/>
    <circle cx="22" cy="21" r="5" fill="#f87171"/>
    <circle cx="38" cy="21" r="5" fill="#fbbf24"/>
    <circle cx="54" cy="21" r="5" fill="#34d399"/>
    <text x="76" y="26" font-family="monospace" font-size="12" fill="#94a3b8">talent.arwebcrafts.com/senior-engineer</text>

    <!-- Profile & Tech Matrix -->
    <g transform="translate(36, 65)">
      <rect width="640" height="295" rx="10" fill="#020b18" stroke="#BE8C33" stroke-width="1.2"/>
      
      <!-- Senior Engineer Badge Card (Left) -->
      <g transform="translate(24, 25)">
        <rect width="250" height="245" rx="8" fill="#071e3d" stroke="#255a9b" stroke-width="1"/>
        <circle cx="125" cy="55" r="32" fill="#BE8C33"/>
        <text x="125" y="63" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="#011B39">&lt;/&gt;</text>
        <text x="125" y="112" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Senior Full-Stack Architect</text>
        <text x="125" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#F2D184">AR Webcrafts Engineering Team</text>
        
        <rect x="25" y="145" width="200" height="28" rx="4" fill="#064e3b"/>
        <text x="125" y="163" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#34d399">&#x25CF; AVAILABLE FOR DEDICATED HIRE</text>

        <text x="125" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#94a3b8">8+ Years Enterprise Experience</text>
        <text x="125" y="218" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#cbd5e1">100% Timezone Aligned</text>
      </g>

      <!-- Tech Stack & Competencies (Right) -->
      <g transform="translate(300, 25)">
        <text x="0" y="18" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Verified Technical Competencies</text>
        
        <g transform="translate(0, 35)">
          <rect width="145" height="42" rx="6" fill="#092244"/>
          <text x="12" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#38bdf8">PHP 8.2+ / OOP</text>
        </g>
        <g transform="translate(160, 35)">
          <rect width="145" height="42" rx="6" fill="#092244"/>
          <text x="12" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#F2D184">React &amp; Gutenberg</text>
        </g>
        <g transform="translate(0, 88)">
          <rect width="145" height="42" rx="6" fill="#092244"/>
          <text x="12" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#4ade80">WooCommerce Core</text>
        </g>
        <g transform="translate(160, 88)">
          <rect width="145" height="42" rx="6" fill="#092244"/>
          <text x="12" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#c084fc">REST &amp; GraphQL</text>
        </g>

        <!-- Hiring Terms Banner -->
        <g transform="translate(0, 145)">
          <rect width="305" height="100" rx="8" fill="#031021" stroke="#1d487c" stroke-width="1"/>
          <text x="14" y="25" font-family="sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">&#x2713; Full-Time or Part-Time Dedicated</text>
          <text x="14" y="45" font-family="sans-serif" font-size="10" fill="#94a3b8">&#x2713; Daily Standups &amp; Slack/Git Integration</text>
          <text x="14" y="65" font-family="sans-serif" font-size="10" fill="#94a3b8">&#x2713; 1-Week Risk-Free Trial Period</text>
          <text x="14" y="85" font-family="sans-serif" font-size="10" font-weight="700" fill="#F2D184">&#x2713; Zero Headhunting or Agency Middleman Fees</text>
        </g>
      </g>
    </g>
  </g>`
});
fs.writeFileSync(path.join(targetDir, 'hire-full-stack-developer.svg'), hireDevSvg);

console.log('Successfully generated all 18 modern, high-quality bespoke SVGs!');
