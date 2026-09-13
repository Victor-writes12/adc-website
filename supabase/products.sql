CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cctv', 'solar', 'inverter', 'smart')),
  description text NOT NULL,
  search_terms text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  compare_at_price numeric CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  image_url text NOT NULL,
  badge text,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON public.products;

CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true);

INSERT INTO public.products
  (id, name, category, description, search_terms, price, compare_at_price, image_url, badge)
VALUES
  ('p01', '4MP Dome IP Camera', 'cctv', 'Indoor/outdoor dome camera with night vision and motion alerts.', '4mp dome ip camera cctv surveillance', 45000, NULL, 'assets/images/camera-dome-purevision.jpg', 'Bestseller'),
  ('p02', 'Bullet Outdoor Camera', 'cctv', 'Weatherproof long-range bullet camera for perimeter coverage.', 'bullet outdoor camera cctv surveillance', 52000, 58000, 'assets/images/camera-solar-outdoor.jpg', 'Sale'),
  ('p03', '8-Channel NVR Recorder', 'cctv', 'Network video recorder supporting up to 8 IP cameras with 2TB bay.', '8-channel nvr recorder cctv surveillance', 120000, NULL, 'assets/images/dvr2sale.jpg', NULL),
  ('p04', 'WiFi Smart Camera', 'cctv', 'Plug-and-play indoor WiFi camera with two-way audio and app viewing.', 'wifi smart camera cctv surveillance', 38000, NULL, 'assets/images/camera-mini-ptz.jpg', 'New'),
  ('p05', '350W Monocrystalline Panel', 'solar', 'High-efficiency panel with 20+ year performance warranty.', '350w monocrystalline panel solar power', 185000, NULL, 'assets/images/solar-panel-jinko.jpg', 'Bestseller'),
  ('p06', 'MPPT Solar Charge Controller', 'solar', '60A MPPT controller for maximum solar harvest and battery protection.', 'mppt solar charge controller solar power', 65000, NULL, 'assets/images/inverter-back-panel.jpg', NULL),
  ('p07', '200Ah Lithium Battery', 'solar', 'Deep-cycle LiFePO4 battery built for daily solar cycling.', '200ah lithium battery solar power', 420000, 460000, 'assets/images/inverter-back-panel.jpg', 'Sale'),
  ('p08', '3.5kVA Pure Sine Inverter', 'inverter', 'Reliable pure sine-wave inverter for home and small office loads.', '3.5kva pure sine inverter inverter backup', 310000, NULL, 'assets/images/inverter-luxsun.jpg', NULL),
  ('p09', '5kVA Hybrid Inverter', 'inverter', 'Hybrid inverter that blends solar, battery and grid power automatically.', '5kva hybrid inverter inverter backup', 560000, NULL, 'assets/images/inverter-haisic.jpg', 'Bestseller'),
  ('p10', 'Automatic Voltage Stabilizer', 'inverter', 'Protects appliances from voltage spikes and irregular grid supply.', 'automatic voltage stabilizer inverter backup', 95000, NULL, 'assets/images/inverter-back-panel.jpg', NULL),
  ('p11', 'Smart WiFi Video Doorbell', 'smart', 'See and speak to visitors from anywhere with motion-triggered alerts.', 'smart wifi video doorbell smart home', 68000, NULL, 'assets/images/camera-mini-ptz.jpg', 'New'),
  ('p12', 'Smart Door Lock', 'smart', 'Keyless entry with PIN code, fingerprint and app-based access.', 'smart door lock smart home', 75000, NULL, 'assets/images/smartdoor.jpg', NULL),
  ('p13', 'Smart Plug (2-Pack)', 'smart', 'WiFi smart plugs for scheduling and remote control of any appliance.', 'smart plug 2-pack smart home', 18000, 22000, 'assets/images/io.jpg', 'Sale'),
  ('p14', 'Home Automation Hub', 'smart', 'Central hub connecting lighting, locks, cameras and climate in one app.', 'home automation hub smart home', 95000, NULL, 'assets/images/io.jpg', NULL)
ON CONFLICT (id) DO UPDATE SET
  updated_at = now(),
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  search_terms = EXCLUDED.search_terms,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge;
