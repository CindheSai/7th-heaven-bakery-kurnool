-- PostgreSQL / Supabase Schema for 7th Heaven Bakery & Cafe
-- Automatically applied on server boot when DATABASE_URL is configured,
-- or run manually against a fresh PostgreSQL database.

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  positioning TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  hours TEXT NOT NULL,
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT NOT NULL,
  promo_banner TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('Savouries & Sips', 'Sweet Side')),
  category TEXT NOT NULL,
  price INTEGER,
  variants JSONB, -- e.g. [{"label":"6-inch","price":135},{"label":"8-inch","price":160}]
  unit_note TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cake_collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  half_kg_price INTEGER,
  one_kg_price INTEGER,
  pastry_price INTEGER,
  pastry_size_label TEXT,
  per_kg_price INTEGER,
  serve_size_note TEXT,
  price_verification_status TEXT NOT NULL DEFAULT 'verified',
  verification_note TEXT,
  flavours JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_custom_category BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cake_enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  cake_category TEXT NOT NULL,
  preferred_flavour TEXT NOT NULL,
  cake_weight TEXT NOT NULL,
  shape_or_design TEXT NOT NULL,
  required_date TEXT NOT NULL,
  reference_image_url TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Confirmed', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_requests (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  fulfillment TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  estimated_subtotal INTEGER NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Confirmed', 'Ready', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Replied', 'Resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  caption TEXT NOT NULL,
  is_authentic_business_photo BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  filename TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
