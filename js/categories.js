/* ============================================
   ADC SYSTEMS — CATEGORY / SUBCATEGORY TAXONOMY
   Single source of truth for the shop category nav and the dashboard
   product form. To add, remove, or rename a category or subcategory,
   edit this array only — shop.html and dashboard.html read from it
   automatically. Nothing else needs to change.

   Load this file BEFORE js/store.js on shop.html/checkout.html/product.html,
   and BEFORE js/dashboard.js on dashboard.html.
   ============================================ */

window.ADC_CATEGORIES = [
  {
    slug: "security-surveillance",
    name: "Security & Surveillance",
    subcategories: [
      { slug: "cctv-cameras", name: "CCTV Cameras" },
      { slug: "ip-cameras", name: "IP Cameras" },
      { slug: "ptz-cameras", name: "PTZ Cameras" },
      { slug: "dvr", name: "DVR" },
      { slug: "nvr", name: "NVR" },
      { slug: "cctv-accessories", name: "CCTV Accessories" },
      { slug: "cctv-power-supplies", name: "CCTV Power Supplies" },
      { slug: "cctv-cables", name: "CCTV Cables" },
      { slug: "surveillance-storage", name: "Surveillance Storage" },
      { slug: "cctv-kits", name: "CCTV Kits" }
    ]
  },
  {
    slug: "networking",
    name: "Networking",
    subcategories: [
      { slug: "routers", name: "Routers" },
      { slug: "network-switches", name: "Network Switches" },
      { slug: "poe-switches", name: "PoE Switches" },
      { slug: "wireless-access-points", name: "Wireless Access Points" },
      { slug: "network-racks", name: "Network Racks" },
      { slug: "patch-panels", name: "Patch Panels" },
      { slug: "network-accessories", name: "Network Accessories" },
      { slug: "network-tools", name: "Network Tools" }
    ]
  },
  {
    slug: "cables-connectivity",
    name: "Cables & Connectivity",
    subcategories: [
      { slug: "cat5e", name: "CAT5e" },
      { slug: "cat6", name: "CAT6" },
      { slug: "cat6a", name: "CAT6A" },
      { slug: "coaxial-cable", name: "Coaxial Cable" },
      { slug: "fiber-optic-cable", name: "Fiber Optic Cable" },
      { slug: "hdmi", name: "HDMI" },
      { slug: "usb", name: "USB" },
      { slug: "telephone-cable", name: "Telephone Cable" },
      { slug: "patch-cords", name: "Patch Cords" },
      { slug: "connectors", name: "Connectors" }
    ]
  },
  {
    slug: "fiber-optics",
    name: "Fiber Optics",
    subcategories: [
      { slug: "fiber-cables", name: "Fiber Cables" },
      { slug: "fiber-patch-cords", name: "Fiber Patch Cords" },
      { slug: "media-converters", name: "Media Converters" },
      { slug: "sfp-modules", name: "SFP Modules" },
      { slug: "fiber-enclosures", name: "Fiber Enclosures" },
      { slug: "fiber-accessories", name: "Fiber Accessories" }
    ]
  },
  {
    slug: "solar-power",
    name: "Solar Power",
    subcategories: [
      { slug: "solar-panels", name: "Solar Panels" },
      { slug: "solar-inverters", name: "Solar Inverters" },
      { slug: "solar-batteries", name: "Solar Batteries" },
      { slug: "lithium-batteries-solar", name: "Lithium Batteries" },
      { slug: "charge-controllers", name: "Charge Controllers" },
      { slug: "solar-accessories", name: "Solar Accessories" }
    ]
  },
  {
    slug: "inverter-backup-power",
    name: "Inverter & Backup Power",
    subcategories: [
      { slug: "hybrid-inverters", name: "Hybrid Inverters" },
      { slug: "pure-sine-wave-inverters", name: "Pure Sine Wave Inverters" },
      { slug: "inverter-batteries", name: "Inverter Batteries" },
      { slug: "lithium-batteries-inverter", name: "Lithium Batteries" },
      { slug: "ups", name: "UPS" },
      { slug: "voltage-stabilizers", name: "Voltage Stabilizers" },
      { slug: "backup-power-accessories", name: "Backup Power Accessories" }
    ]
  },
  {
    slug: "smart-home",
    name: "Smart Home",
    subcategories: [
      { slug: "smart-door-locks", name: "Smart Door Locks" },
      { slug: "video-doorbells", name: "Video Doorbells" },
      { slug: "smart-cameras", name: "Smart Cameras" },
      { slug: "smart-plugs", name: "Smart Plugs" },
      { slug: "smart-switches", name: "Smart Switches" },
      { slug: "smart-lighting", name: "Smart Lighting" },
      { slug: "automation-hubs", name: "Automation Hubs" },
      { slug: "sensors", name: "Sensors" }
    ]
  },
  {
    slug: "access-control",
    name: "Access Control",
    subcategories: [
      { slug: "biometric-devices", name: "Biometric Devices" },
      { slug: "fingerprint-readers", name: "Fingerprint Readers" },
      { slug: "rfid", name: "RFID" },
      { slug: "access-control-panels", name: "Access Control Panels" },
      { slug: "magnetic-locks", name: "Magnetic Locks" },
      { slug: "electric-locks", name: "Electric Locks" },
      { slug: "exit-buttons", name: "Exit Buttons" },
      { slug: "access-cards", name: "Access Cards" }
    ]
  },
  {
    slug: "electric-fence-perimeter-security",
    name: "Electric Fence & Perimeter Security",
    subcategories: [
      { slug: "electric-fence-energizers", name: "Electric Fence Energizers" },
      { slug: "fence-wire", name: "Fence Wire" },
      { slug: "fence-accessories", name: "Fence Accessories" },
      { slug: "warning-signs", name: "Warning Signs" }
    ]
  },
  {
    slug: "intercom-communication",
    name: "Intercom & Communication",
    subcategories: [
      { slug: "video-intercom", name: "Video Intercom" },
      { slug: "audio-intercom", name: "Audio Intercom" },
      { slug: "door-stations", name: "Door Stations" },
      { slug: "indoor-stations", name: "Indoor Stations" },
      { slug: "intercom-accessories", name: "Accessories" }
    ]
  },
  {
    slug: "audio-public-address",
    name: "Audio & Public Address",
    subcategories: [
      { slug: "amplifiers", name: "Amplifiers" },
      { slug: "speakers", name: "Speakers" },
      { slug: "microphones", name: "Microphones" },
      { slug: "wireless-microphones", name: "Wireless Microphones" },
      { slug: "pa-systems", name: "PA Systems" },
      { slug: "audio-accessories", name: "Audio Accessories" }
    ]
  },
  {
    slug: "electrical-power-accessories",
    name: "Electrical & Power Accessories",
    subcategories: [
      { slug: "surge-protection", name: "Surge Protection" },
      { slug: "voltage-protection", name: "Voltage Protection" },
      { slug: "extension-sockets", name: "Extension Sockets" },
      { slug: "power-distribution", name: "Power Distribution" },
      { slug: "adapters", name: "Adapters" }
    ]
  },
  {
    slug: "computer-it-accessories",
    name: "Computer & IT Accessories",
    subcategories: [
      { slug: "monitors", name: "Monitors" },
      { slug: "keyboards", name: "Keyboards" },
      { slug: "mouse", name: "Mouse" },
      { slug: "storage", name: "Storage" },
      { slug: "usb-accessories", name: "USB Accessories" },
      { slug: "computer-accessories", name: "Computer Accessories" }
    ]
  }
];

/* Look up a category or subcategory display name by slug. Used by
   store.js and product.js so nothing renders a raw slug like
   "cctv-cameras" to a customer. */
window.ADC_categoryName = function (slug) {
  var cat = window.ADC_CATEGORIES.filter(function (c) { return c.slug === slug; })[0];
  return cat ? cat.name : slug;
};
window.ADC_subcategoryName = function (categorySlug, subcategorySlug) {
  var cat = window.ADC_CATEGORIES.filter(function (c) { return c.slug === categorySlug; })[0];
  if (!cat) return subcategorySlug;
  var sub = cat.subcategories.filter(function (s) { return s.slug === subcategorySlug; })[0];
  return sub ? sub.name : subcategorySlug;
};
