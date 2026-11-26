-- PostgreSQL / Supabase Reference Schema for 7th Heaven Bakery & Cafe
-- Note: The live Express backend persists to server/data/store.json out of the box
-- and can be switched to PostgreSQL using these exact relational tables.

CREATE TABLE site_settings (
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

CREATE TABLE menu_items (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cake_collections (
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cake_enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  cake_category TEXT NOT NULL,
  preferred_flavour TEXT NOT NULL,
  cake_weight TEXT NOT NULL,
  shape_or_design TEXT NOT NULL,
  required_date DATE NOT NULL,
  reference_image_url TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Confirmed', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  caption TEXT NOT NULL,
  is_authentic_business_photo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_credentials (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
