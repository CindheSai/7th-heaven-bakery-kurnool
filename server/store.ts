import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { INITIAL_STORE_DATA } from '../src/data/seedData.ts';
import type {
  CakeCollection,
  CakeEnquiry,
  ContactMessage,
  GalleryItem,
  MenuItem,
  OrderRequest,
  SiteSettings,
  StoreData,
} from '../src/types/bakery.ts';

export interface AdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

export interface PersistedStore extends StoreData {
  adminCredential?: AdminCredential;
  sessionSecret?: string;
}

const DATA_DIR = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.resolve(process.cwd(), 'server', 'data');

const STORE_PATH = path.join(DATA_DIR, 'store.json');

export const UPLOADS_DIR = process.env.UPLOADS_DIR?.trim()
  ? path.resolve(process.env.UPLOADS_DIR.trim())
  : process.env.DATA_DIR?.trim()
    ? path.join(DATA_DIR, 'uploads')
    : path.resolve(process.cwd(), 'server', 'uploads');

const DATABASE_URL = process.env.DATABASE_URL?.trim() || '';
let pool: Pool | null = null;
let jsonLock: Promise<unknown> = Promise.resolve();

function getSslConfig(connectionString: string): false | { rejectUnauthorized: boolean } {
  const flag = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return { rejectUnauthorized: false };
  const isLocal =
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  return isLocal ? false : { rejectUnauthorized: false };
}

export function getStorageMode(): 'postgres' | 'json' {
  return DATABASE_URL ? 'postgres' : 'json';
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: getSslConfig(DATABASE_URL),
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

function ensureDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function normalizeStore(parsed: Partial<PersistedStore>): PersistedStore {
  return {
    settings: parsed.settings
      ? { ...structuredClone(INITIAL_STORE_DATA.settings), ...parsed.settings }
      : structuredClone(INITIAL_STORE_DATA.settings),
    menuItems: Array.isArray(parsed.menuItems)
      ? parsed.menuItems
      : structuredClone(INITIAL_STORE_DATA.menuItems),
    cakeCollections: Array.isArray(parsed.cakeCollections)
      ? parsed.cakeCollections
      : structuredClone(INITIAL_STORE_DATA.cakeCollections),
    gallery: Array.isArray(parsed.gallery)
      ? parsed.gallery
      : structuredClone(INITIAL_STORE_DATA.gallery),
    enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
    adminCredential: parsed.adminCredential,
    sessionSecret: parsed.sessionSecret,
  };
}

function readJsonStoreSync(): PersistedStore {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = normalizeStore({
      ...structuredClone(INITIAL_STORE_DATA),
      sessionSecret: crypto.randomBytes(32).toString('hex'),
    });
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return normalizeStore(JSON.parse(raw) as Partial<PersistedStore>);
  } catch {
    const fallback = normalizeStore(structuredClone(INITIAL_STORE_DATA));
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function writeJsonStoreSync(nextStore: PersistedStore): void {
  ensureDirs();
  const tempPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(nextStore, null, 2), 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

function withJsonLock<T>(fn: (store: PersistedStore) => { store?: PersistedStore; result: T }): Promise<T> {
  const next = jsonLock.then(() => {
    const current = readJsonStoreSync();
    const { store: updated, result } = fn(current);
    if (updated) {
      writeJsonStoreSync(updated);
    }
    return result;
  });
  jsonLock = next.catch(() => undefined);
  return next;
}

function mapSettingsRow(row: Record<string, unknown>): SiteSettings {
  return {
    brandName: String(row.brand_name),
    tagline: String(row.tagline),
    positioning: String(row.positioning),
    phone: String(row.phone),
    whatsappNumber: String(row.whatsapp_number),
    instagramHandle: String(row.instagram_handle),
    instagramUrl: String(row.instagram_url),
    addressLine1: String(row.address_line1),
    addressLine2: String(row.address_line2 ?? ''),
    city: String(row.city),
    state: String(row.state),
    postalCode: String(row.postal_code),
    country: String(row.country),
    hours: String(row.hours),
    heroHeadline: String(row.hero_headline),
    heroSubheadline: String(row.hero_subheadline),
    promoBanner: String(row.promo_banner),
  };
}

function mapMenuRow(row: Record<string, unknown>): MenuItem {
  return {
    id: String(row.id),
    name: String(row.name),
    section: row.section as MenuItem['section'],
    category: String(row.category),
    price: row.price !== null && row.price !== undefined ? Number(row.price) : undefined,
    variants: Array.isArray(row.variants) ? (row.variants as MenuItem['variants']) : undefined,
    unitNote: row.unit_note ? String(row.unit_note) : undefined,
    isVeg: Boolean(row.is_veg),
    available: Boolean(row.available),
    image: row.image ? String(row.image) : undefined,
    description: row.description ? String(row.description) : undefined,
  };
}

function mapCakeRow(row: Record<string, unknown>): CakeCollection {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    image: String(row.image),
    halfKgPrice: row.half_kg_price !== null && row.half_kg_price !== undefined ? Number(row.half_kg_price) : null,
    oneKgPrice: row.one_kg_price !== null && row.one_kg_price !== undefined ? Number(row.one_kg_price) : null,
    pastryPrice: row.pastry_price !== null && row.pastry_price !== undefined ? Number(row.pastry_price) : null,
    pastrySizeLabel: row.pastry_size_label ? String(row.pastry_size_label) : undefined,
    perKgPrice: row.per_kg_price !== null && row.per_kg_price !== undefined ? Number(row.per_kg_price) : null,
    serveSizeNote: row.serve_size_note ? String(row.serve_size_note) : undefined,
    priceVerificationStatus: row.price_verification_status as CakeCollection['priceVerificationStatus'],
    verificationNote: row.verification_note ? String(row.verification_note) : undefined,
    flavours: Array.isArray(row.flavours) ? (row.flavours as CakeCollection['flavours']) : [],
    isCustomCategory: Boolean(row.is_custom_category),
  };
}

function mapGalleryRow(row: Record<string, unknown>): GalleryItem {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category as GalleryItem['category'],
    image: String(row.image),
    caption: String(row.caption),
    isAuthenticBusinessPhoto: Boolean(row.is_authentic_business_photo),
  };
}

function mapEnquiryRow(row: Record<string, unknown>): CakeEnquiry {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    mobileNumber: String(row.mobile_number),
    cakeCategory: String(row.cake_category),
    preferredFlavour: String(row.preferred_flavour),
    cakeWeight: String(row.cake_weight),
    shapeOrDesign: String(row.shape_or_design),
    requiredDate: String(row.required_date),
    referenceImageUrl: row.reference_image_url ? String(row.reference_image_url) : undefined,
    instructions: row.instructions ? String(row.instructions) : undefined,
    status: row.status as CakeEnquiry['status'],
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapOrderRow(row: Record<string, unknown>): OrderRequest {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    mobileNumber: String(row.mobile_number),
    fulfillment: row.fulfillment as OrderRequest['fulfillment'],
    items: Array.isArray(row.items) ? (row.items as OrderRequest['items']) : [],
    estimatedSubtotal: Number(row.estimated_subtotal),
    notes: row.notes ? String(row.notes) : undefined,
    status: row.status as OrderRequest['status'],
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapContactRow(row: Record<string, unknown>): ContactMessage {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : undefined,
    subject: String(row.subject),
    message: String(row.message),
    status: row.status as ContactMessage['status'],
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function initStorage(): Promise<void> {
  if (getStorageMode() === 'json') {
    const store = readJsonStoreSync();
    if (!store.sessionSecret) {
      store.sessionSecret = crypto.randomBytes(32).toString('hex');
      writeJsonStoreSync(store);
    }
    return;
  }

  const db = getPool();
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');
  await db.query(ddl);

  // Ensure sort_order columns exist if upgrading an existing database
  await db.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE cake_collections ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE cake_enquiries ALTER COLUMN required_date TYPE TEXT USING required_date::TEXT;`);

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const settingsCount = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM site_settings'
    );
    if (Number(settingsCount.rows[0]?.count ?? 0) === 0) {
      const s = INITIAL_STORE_DATA.settings;
      await client.query(
        `INSERT INTO site_settings (
          id, brand_name, tagline, positioning, phone, whatsapp_number,
          instagram_handle, instagram_url, address_line1, address_line2,
          city, state, postal_code, country, hours,
          hero_headline, hero_subheadline, promo_banner
        ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          s.brandName,
          s.tagline,
          s.positioning,
          s.phone,
          s.whatsappNumber,
          s.instagramHandle,
          s.instagramUrl,
          s.addressLine1,
          s.addressLine2,
          s.city,
          s.state,
          s.postalCode,
          s.country,
          s.hours,
          s.heroHeadline,
          s.heroSubheadline,
          s.promoBanner,
        ]
      );
    }

    const menuCount = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM menu_items'
    );
    if (Number(menuCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.menuItems.length; i++) {
        const m = INITIAL_STORE_DATA.menuItems[i];
        await client.query(
          `INSERT INTO menu_items (
            id, name, section, category, price, variants, unit_note,
            is_veg, available, image, description, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            m.id,
            m.name,
            m.section,
            m.category,
            m.price ?? null,
            m.variants ? JSON.stringify(m.variants) : null,
            m.unitNote ?? null,
            m.isVeg,
            m.available,
            m.image ?? null,
            m.description ?? null,
            i,
          ]
        );
      }
    }

    const cakeCount = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM cake_collections'
    );
    if (Number(cakeCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.cakeCollections.length; i++) {
        const c = INITIAL_STORE_DATA.cakeCollections[i];
        await client.query(
          `INSERT INTO cake_collections (
            id, name, slug, description, image, half_kg_price, one_kg_price,
            pastry_price, pastry_size_label, per_kg_price, serve_size_note,
            price_verification_status, verification_note, flavours, is_custom_category, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            c.id,
            c.name,
            c.slug,
            c.description,
            c.image,
            c.halfKgPrice ?? null,
            c.oneKgPrice ?? null,
            c.pastryPrice ?? null,
            c.pastrySizeLabel ?? null,
            c.perKgPrice ?? null,
            c.serveSizeNote ?? null,
            c.priceVerificationStatus,
            c.verificationNote ?? null,
            JSON.stringify(c.flavours),
            Boolean(c.isCustomCategory),
            i,
          ]
        );
      }
    }

    const galCount = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM gallery_items'
    );
    if (Number(galCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.gallery.length; i++) {
        const g = INITIAL_STORE_DATA.gallery[i];
        await client.query(
          `INSERT INTO gallery_items (
            id, title, category, image, caption, is_authentic_business_photo, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [g.id, g.title, g.category, g.image, g.caption, g.isAuthenticBusinessPhoto, i]
        );
      }
    }

    const secretRow = await client.query<{ value: string }>(
      "SELECT value FROM app_secrets WHERE key = 'session_secret'"
    );
    if (secretRow.rowCount === 0) {
      await client.query(
        "INSERT INTO app_secrets (key, value) VALUES ('session_secret', $1)",
        [crypto.randomBytes(32).toString('hex')]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function checkStorageHealth(): Promise<boolean> {
  if (getStorageMode() === 'json') {
    ensureDirs();
    return fs.existsSync(STORE_PATH);
  }
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function getSessionSecretFromStore(): Promise<string> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      if (!store.sessionSecret) {
        const secret = crypto.randomBytes(32).toString('hex');
        return { store: { ...store, sessionSecret: secret }, result: secret };
      }
      return { result: store.sessionSecret };
    });
  }
  const res = await getPool().query<{ value: string }>(
    "SELECT value FROM app_secrets WHERE key = 'session_secret'"
  );
  if (res.rows[0]?.value) return res.rows[0].value;
  const secret = crypto.randomBytes(32).toString('hex');
  await getPool().query(
    "INSERT INTO app_secrets (key, value) VALUES ('session_secret', $1) ON CONFLICT (key) DO NOTHING",
    [secret]
  );
  return secret;
}

export async function getAdminCredential(): Promise<AdminCredential | null> {
  if (getStorageMode() === 'json') {
    const store = readJsonStoreSync();
    return store.adminCredential ?? null;
  }
  const res = await getPool().query<{
    password_hash: string;
    salt: string;
    claimed_at: string;
  }>('SELECT password_hash, salt, claimed_at FROM admin_credentials WHERE id = 1');
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    hash: row.password_hash,
    salt: row.salt,
    claimedAt: new Date(row.claimed_at).toISOString(),
  };
}

export async function saveAdminCredential(cred: AdminCredential): Promise<boolean> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      if (store.adminCredential?.hash) {
        return { result: false };
      }
      return { store: { ...store, adminCredential: cred }, result: true };
    });
  }
  const res = await getPool().query(
    `INSERT INTO admin_credentials (id, password_hash, salt, claimed_at)
     VALUES (1, $1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [cred.hash, cred.salt, cred.claimedAt]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function getPublicStore(): Promise<
  Pick<StoreData, 'settings' | 'menuItems' | 'cakeCollections' | 'gallery'>
> {
  if (getStorageMode() === 'json') {
    const store = readJsonStoreSync();
    return {
      settings: store.settings,
      menuItems: store.menuItems,
      cakeCollections: store.cakeCollections,
      gallery: store.gallery,
    };
  }
  const db = getPool();
  const [settingsRes, menuRes, cakesRes, galleryRes] = await Promise.all([
    db.query('SELECT * FROM site_settings WHERE id = 1'),
    db.query('SELECT * FROM menu_items ORDER BY sort_order ASC, created_at DESC'),
    db.query('SELECT * FROM cake_collections ORDER BY sort_order ASC'),
    db.query('SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC'),
  ]);
  return {
    settings: settingsRes.rows[0]
      ? mapSettingsRow(settingsRes.rows[0])
      : structuredClone(INITIAL_STORE_DATA.settings),
    menuItems: menuRes.rows.map(mapMenuRow),
    cakeCollections: cakesRes.rows.map(mapCakeRow),
    gallery: galleryRes.rows.map(mapGalleryRow),
  };
}

export async function getAdminDashboardData(): Promise<StoreData> {
  if (getStorageMode() === 'json') {
    const store = readJsonStoreSync();
    return {
      settings: store.settings,
      menuItems: store.menuItems,
      cakeCollections: store.cakeCollections,
      gallery: store.gallery,
      enquiries: store.enquiries,
      orders: store.orders,
      contacts: store.contacts,
    };
  }
  const db = getPool();
  const [pub, enqRes, ordRes, conRes] = await Promise.all([
    getPublicStore(),
    db.query('SELECT * FROM cake_enquiries ORDER BY created_at DESC'),
    db.query('SELECT * FROM order_requests ORDER BY created_at DESC'),
    db.query('SELECT * FROM contact_messages ORDER BY created_at DESC'),
  ]);
  return {
    ...pub,
    enquiries: enqRes.rows.map(mapEnquiryRow),
    orders: ordRes.rows.map(mapOrderRow),
    contacts: conRes.rows.map(mapContactRow),
  };
}

export async function addMenuItem(item: MenuItem): Promise<MenuItem> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.menuItems.unshift(item);
      return { store, result: item };
    });
  }
  const res = await getPool().query(
    `INSERT INTO menu_items (
      id, name, section, category, price, variants, unit_note,
      is_veg, available, image, description, sort_order
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,-1)
    RETURNING *`,
    [
      item.id,
      item.name,
      item.section,
      item.category,
      item.price ?? null,
      item.variants ? JSON.stringify(item.variants) : null,
      item.unitNote ?? null,
      item.isVeg,
      item.available,
      item.image ?? null,
      item.description ?? null,
    ]
  );
  return mapMenuRow(res.rows[0]);
}

export async function updateMenuItem(
  id: string,
  patch: Partial<MenuItem>
): Promise<MenuItem | null> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const idx = store.menuItems.findIndex((m) => m.id === id);
      if (idx === -1) return { result: null };
      store.menuItems[idx] = { ...store.menuItems[idx], ...patch };
      return { store, result: store.menuItems[idx] };
    });
  }
  const existingRes = await getPool().query('SELECT * FROM menu_items WHERE id = $1', [id]);
  if (existingRes.rowCount === 0) return null;
  const current = mapMenuRow(existingRes.rows[0]);
  const merged: MenuItem = { ...current, ...patch, id };
  const res = await getPool().query(
    `UPDATE menu_items SET
      name = $2,
      section = $3,
      category = $4,
      price = $5,
      variants = $6,
      unit_note = $7,
      is_veg = $8,
      available = $9,
      image = $10,
      description = $11,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.name,
      merged.section,
      merged.category,
      merged.price ?? null,
      merged.variants ? JSON.stringify(merged.variants) : null,
      merged.unitNote ?? null,
      merged.isVeg,
      merged.available,
      merged.image ?? null,
      merged.description ?? null,
    ]
  );
  return mapMenuRow(res.rows[0]);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const before = store.menuItems.length;
      store.menuItems = store.menuItems.filter((m) => m.id !== id);
      return store.menuItems.length < before
        ? { store, result: true }
        : { result: false };
    });
  }
  const res = await getPool().query('DELETE FROM menu_items WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function renameMenuCategory(
  section: MenuItem['section'],
  fromCategory: string,
  toCategory: string
): Promise<number> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      let count = 0;
      store.menuItems = store.menuItems.map((item) => {
        if (item.section === section && item.category === fromCategory) {
          count++;
          return { ...item, category: toCategory };
        }
        return item;
      });
      return count > 0 ? { store, result: count } : { result: 0 };
    });
  }
  const res = await getPool().query(
    `UPDATE menu_items SET category = $3, updated_at = NOW()
     WHERE section = $1 AND category = $2`,
    [section, fromCategory, toCategory]
  );
  return res.rowCount ?? 0;
}

export async function updateCakeCollection(
  id: string,
  patch: Partial<CakeCollection>
): Promise<CakeCollection | null> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const idx = store.cakeCollections.findIndex((c) => c.id === id);
      if (idx === -1) return { result: null };
      store.cakeCollections[idx] = { ...store.cakeCollections[idx], ...patch };
      return { store, result: store.cakeCollections[idx] };
    });
  }
  const existingRes = await getPool().query('SELECT * FROM cake_collections WHERE id = $1', [id]);
  if (existingRes.rowCount === 0) return null;
  const current = mapCakeRow(existingRes.rows[0]);
  const merged: CakeCollection = { ...current, ...patch, id };
  const res = await getPool().query(
    `UPDATE cake_collections SET
      description = $2,
      image = $3,
      half_kg_price = $4,
      one_kg_price = $5,
      pastry_price = $6,
      per_kg_price = $7,
      price_verification_status = $8,
      verification_note = $9,
      flavours = $10,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.description,
      merged.image,
      merged.halfKgPrice ?? null,
      merged.oneKgPrice ?? null,
      merged.pastryPrice ?? null,
      merged.perKgPrice ?? null,
      merged.priceVerificationStatus,
      merged.verificationNote ?? null,
      JSON.stringify(merged.flavours),
    ]
  );
  return mapCakeRow(res.rows[0]);
}

export async function addEnquiry(enquiry: CakeEnquiry): Promise<CakeEnquiry> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.enquiries.unshift(enquiry);
      return { store, result: enquiry };
    });
  }
  const res = await getPool().query(
    `INSERT INTO cake_enquiries (
      id, customer_name, mobile_number, cake_category, preferred_flavour,
      cake_weight, shape_or_design, required_date, reference_image_url, instructions, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      enquiry.id,
      enquiry.customerName,
      enquiry.mobileNumber,
      enquiry.cakeCategory,
      enquiry.preferredFlavour,
      enquiry.cakeWeight,
      enquiry.shapeOrDesign,
      enquiry.requiredDate,
      enquiry.referenceImageUrl ?? null,
      enquiry.instructions ?? null,
      enquiry.status,
      enquiry.createdAt,
    ]
  );
  return mapEnquiryRow(res.rows[0]);
}

export async function updateEnquiryStatus(
  id: string,
  status: CakeEnquiry['status']
): Promise<CakeEnquiry | null> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const idx = store.enquiries.findIndex((e) => e.id === id);
      if (idx === -1) return { result: null };
      store.enquiries[idx].status = status;
      return { store, result: store.enquiries[idx] };
    });
  }
  const res = await getPool().query(
    'UPDATE cake_enquiries SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return res.rowCount ? mapEnquiryRow(res.rows[0]) : null;
}

export async function addOrder(order: OrderRequest): Promise<OrderRequest> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.orders.unshift(order);
      return { store, result: order };
    });
  }
  const res = await getPool().query(
    `INSERT INTO order_requests (
      id, customer_name, mobile_number, fulfillment, items,
      estimated_subtotal, notes, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      order.id,
      order.customerName,
      order.mobileNumber,
      order.fulfillment,
      JSON.stringify(order.items),
      order.estimatedSubtotal,
      order.notes ?? null,
      order.status,
      order.createdAt,
    ]
  );
  return mapOrderRow(res.rows[0]);
}

export async function updateOrderStatus(
  id: string,
  status: OrderRequest['status']
): Promise<OrderRequest | null> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const idx = store.orders.findIndex((o) => o.id === id);
      if (idx === -1) return { result: null };
      store.orders[idx].status = status;
      return { store, result: store.orders[idx] };
    });
  }
  const res = await getPool().query(
    'UPDATE order_requests SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return res.rowCount ? mapOrderRow(res.rows[0]) : null;
}

export async function addContactMessage(msg: ContactMessage): Promise<ContactMessage> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.contacts.unshift(msg);
      return { store, result: msg };
    });
  }
  const res = await getPool().query(
    `INSERT INTO contact_messages (
      id, name, phone, email, subject, message, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      msg.id,
      msg.name,
      msg.phone,
      msg.email ?? null,
      msg.subject,
      msg.message,
      msg.status,
      msg.createdAt,
    ]
  );
  return mapContactRow(res.rows[0]);
}

export async function updateContactStatus(
  id: string,
  status: ContactMessage['status']
): Promise<ContactMessage | null> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const idx = store.contacts.findIndex((c) => c.id === id);
      if (idx === -1) return { result: null };
      store.contacts[idx].status = status;
      return { store, result: store.contacts[idx] };
    });
  }
  const res = await getPool().query(
    'UPDATE contact_messages SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return res.rowCount ? mapContactRow(res.rows[0]) : null;
}

export async function addGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.gallery.unshift(item);
      return { store, result: item };
    });
  }
  const res = await getPool().query(
    `INSERT INTO gallery_items (
      id, title, category, image, caption, is_authentic_business_photo, sort_order
    ) VALUES ($1,$2,$3,$4,$5,$6,-1)
    RETURNING *`,
    [item.id, item.title, item.category, item.image, item.caption, item.isAuthenticBusinessPhoto]
  );
  return mapGalleryRow(res.rows[0]);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      const before = store.gallery.length;
      store.gallery = store.gallery.filter((g) => g.id !== id);
      return store.gallery.length < before
        ? { store, result: true }
        : { result: false };
    });
  }
  const res = await getPool().query('DELETE FROM gallery_items WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export async function updateSettings(nextSettings: SiteSettings): Promise<SiteSettings> {
  if (getStorageMode() === 'json') {
    return withJsonLock((store) => {
      store.settings = nextSettings;
      return { store, result: store.settings };
    });
  }
  const res = await getPool().query(
    `UPDATE site_settings SET
      brand_name = $1,
      tagline = $2,
      positioning = $3,
      phone = $4,
      whatsapp_number = $5,
      instagram_handle = $6,
      instagram_url = $7,
      address_line1 = $8,
      address_line2 = $9,
      city = $10,
      state = $11,
      postal_code = $12,
      country = $13,
      hours = $14,
      hero_headline = $15,
      hero_subheadline = $16,
      promo_banner = $17,
      updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
    [
      nextSettings.brandName,
      nextSettings.tagline,
      nextSettings.positioning,
      nextSettings.phone,
      nextSettings.whatsappNumber,
      nextSettings.instagramHandle,
      nextSettings.instagramUrl,
      nextSettings.addressLine1,
      nextSettings.addressLine2,
      nextSettings.city,
      nextSettings.state,
      nextSettings.postalCode,
      nextSettings.country,
      nextSettings.hours,
      nextSettings.heroHeadline,
      nextSettings.heroSubheadline,
      nextSettings.promoBanner,
    ]
  );
  return mapSettingsRow(res.rows[0]);
}

export async function saveUploadedFile(
  filename: string,
  mimeType: string,
  buffer: Buffer
): Promise<void> {
  if (getStorageMode() === 'json') {
    ensureDirs();
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      throw new Error('Invalid upload destination.');
    }
    fs.writeFileSync(targetPath, buffer);
    return;
  }
  await getPool().query(
    `INSERT INTO uploaded_files (filename, mime_type, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (filename) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data`,
    [filename, mimeType, buffer]
  );
}

export async function readUploadedFile(
  filename: string
): Promise<{ mimeType: string; filePath?: string; buffer?: Buffer } | null> {
  if (getStorageMode() === 'json') {
    ensureDirs();
    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      return null;
    }
    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { mimeType, filePath: resolved };
  }
  const res = await getPool().query<{ mime_type: string; data: Buffer }>(
    'SELECT mime_type, data FROM uploaded_files WHERE filename = $1',
    [filename]
  );
  if (res.rowCount === 0) return null;
  return { mimeType: res.rows[0].mime_type, buffer: res.rows[0].data };
}
