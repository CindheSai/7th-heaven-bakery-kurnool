import crypto from 'crypto';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import {
  claimAdminPassword,
  createAdminToken,
  getAuthStatus,
  requireAdmin,
  verifyAdminPassword,
} from './server/auth.ts';
import { readStore, toPublicStore, UPLOADS_DIR, writeStore } from './server/store.ts';
import type { CakeCollection, CakeEnquiry, GalleryItem, MenuItem } from './src/types/bakery.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function isSafeUrl(url?: string): boolean {
  if (!url) return true;
  if (url.startsWith('/')) return !url.startsWith('//');
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const safeUrlSchema = z
  .string()
  .trim()
  .max(600)
  .refine(isSafeUrl, { message: 'Only safe relative paths or http/https URLs are permitted.' });

const menuVariantSchema = z.object({
  label: z.string().trim().min(1).max(40),
  price: z.number().int().min(1).max(100000),
});

const menuItemSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(120),
  section: z.enum(['Savouries & Sips', 'Sweet Side']),
  category: z.string().trim().min(1).max(80),
  price: z.number().int().min(1).max(100000).optional(),
  variants: z.array(menuVariantSchema).max(6).optional(),
  unitNote: z.string().trim().max(120).optional(),
  isVeg: z.boolean().default(true),
  available: z.boolean().default(true),
  image: safeUrlSchema.optional(),
  description: z.string().trim().max(300).optional(),
});

const cakeFlavourSchema = z.object({
  name: z.string().trim().min(1).max(120),
  calories: z.string().trim().max(40).optional(),
  pastryPrice: z.number().int().min(1).max(50000).optional(),
  serveSizeGrams: z.number().int().min(1).max(10000).optional(),
  price500g: z.number().int().min(1).max(50000).optional(),
  isSignature: z.boolean().optional(),
});

const cakeCollectionUpdateSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  image: safeUrlSchema.optional(),
  halfKgPrice: z.number().int().min(1).max(100000).nullable().optional(),
  oneKgPrice: z.number().int().min(1).max(100000).nullable().optional(),
  pastryPrice: z.number().int().min(1).max(100000).nullable().optional(),
  perKgPrice: z.number().int().min(1).max(100000).nullable().optional(),
  priceVerificationStatus: z.enum(['verified', 'needs_verification', 'custom_quote']).optional(),
  verificationNote: z.string().trim().max(300).optional(),
  flavours: z.array(cakeFlavourSchema).min(1).max(50).optional(),
});

const galleryCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.enum([
    'Signature Cakes',
    'Cheesecakes',
    'Brownies',
    'Waffles',
    'Desserts',
    'Savouries',
    'Beverages',
    'Café Experience',
  ]),
  image: safeUrlSchema.refine((v) => v.length > 0, { message: 'Image URL is required.' }),
  caption: z.string().trim().min(1).max(200),
  isAuthenticBusinessPhoto: z.boolean().default(false),
});

const settingsSchema = z.object({
  brandName: z.string().trim().min(1).max(100),
  tagline: z.string().trim().min(1).max(120),
  positioning: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(8).max(20),
  whatsappNumber: z.string().trim().min(10).max(20),
  instagramHandle: z.string().trim().min(1).max(80),
  instagramUrl: safeUrlSchema,
  addressLine1: z.string().trim().min(1).max(150),
  addressLine2: z.string().trim().max(150),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(4).max(20),
  country: z.string().trim().min(1).max(80),
  hours: z.string().trim().min(1).max(80),
  heroHeadline: z.string().trim().min(1).max(160),
  heroSubheadline: z.string().trim().min(1).max(320),
  promoBanner: z.string().trim().min(1).max(220),
});

const cakeEnquirySchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your name').max(100),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, 'Please enter a valid 10-digit mobile number'),
  cakeCategory: z.string().trim().min(1).max(100),
  preferredFlavour: z.string().trim().min(1).max(120),
  cakeWeight: z.string().trim().min(1).max(60),
  shapeOrDesign: z.string().trim().min(1).max(160),
  requiredDate: z.string().trim().min(4).max(30),
  referenceImageUrl: safeUrlSchema.optional(),
  instructions: z.string().trim().max(600).optional(),
});

const uploadImageSchema = z.object({
  dataUrl: z.string().min(30).max(7_200_000),
});

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // Ensure store is initialized on boot
  readStore();

  // Safely serve uploaded cake reference images
  app.get('/uploads/:filename', (req, res) => {
    const rawName = path.basename(req.params.filename || '');
    if (!/^[a-zA-Z0-9._-]+$/.test(rawName)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }
    const resolved = path.resolve(UPLOADS_DIR, rawName);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'File not found.' });
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(resolved);
  });

  // Public bootstrap data
  app.get('/api/bootstrap', (_req, res) => {
    const store = readStore();
    res.json(toPublicStore(store));
  });

  // Public cake reference image upload
  app.post('/api/enquiries/upload', (req, res) => {
    const parsed = uploadImageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid image payload.' });
      return;
    }
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
      parsed.data.dataUrl
    );
    if (!match) {
      res.status(400).json({ error: 'Only JPEG, PNG, or WebP images are supported.' });
      return;
    }
    const [, mime, b64] = match;
    const buffer = Buffer.from(b64, 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be smaller than 5 MB.' });
      return;
    }
    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const filename = `ref-${crypto.randomUUID()}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload destination.' });
      return;
    }
    fs.writeFileSync(targetPath, buffer);
    res.status(201).json({ url: `/uploads/${filename}` });
  });

  // Public custom cake enquiry submission
  app.post('/api/enquiries', (req, res) => {
    const parsed = cakeEnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid enquiry details.',
      });
      return;
    }
    const store = readStore();
    const enquiry: CakeEnquiry = {
      id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
      ...parsed.data,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    store.enquiries.unshift(enquiry);
    writeStore(store);
    res.status(201).json({ enquiry });
  });

  // Admin auth status & login/claim routes
  app.get('/api/admin/auth-status', (_req, res) => {
    res.json(getAuthStatus());
  });

  app.post('/api/admin/claim', (req, res) => {
    const schema = z.object({
      password: z.string().min(8, 'Admin password must be at least 8 characters.').max(128),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid password.' });
      return;
    }
    const result = claimAdminPassword(parsed.data.password);
    if (!result.ok) {
      res.status(409).json({ error: result.error });
      return;
    }
    const token = createAdminToken();
    res.status(201).json({ token });
  });

  app.post('/api/admin/login', (req, res) => {
    const schema = z.object({
      password: z.string().min(1).max(128),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }
    if (!verifyAdminPassword(parsed.data.password)) {
      res.status(401).json({ error: 'Incorrect admin passcode.' });
      return;
    }
    const token = createAdminToken();
    res.json({ token });
  });

  // Protected admin dashboard data & mutations
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const store = readStore();
    res.json({
      settings: store.settings,
      menuItems: store.menuItems,
      cakeCollections: store.cakeCollections,
      gallery: store.gallery,
      enquiries: store.enquiries,
    });
  });

  app.post('/api/admin/menu', requireAdmin, (req, res) => {
    const parsed = menuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid menu item.' });
      return;
    }
    const store = readStore();
    const id =
      parsed.data.id ||
      `custom-${parsed.data.category}-${parsed.data.name}-${Date.now().toString(36)}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
    const newItem: MenuItem = {
      ...parsed.data,
      id,
    };
    store.menuItems.unshift(newItem);
    writeStore(store);
    res.status(201).json({ item: newItem });
  });

  app.patch('/api/admin/menu/:id', requireAdmin, (req, res) => {
    const parsed = menuItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid update.' });
      return;
    }
    const store = readStore();
    const idx = store.menuItems.findIndex((i) => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Menu item not found.' });
      return;
    }
    store.menuItems[idx] = { ...store.menuItems[idx], ...parsed.data };
    writeStore(store);
    res.json({ item: store.menuItems[idx] });
  });

  app.delete('/api/admin/menu/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const before = store.menuItems.length;
    store.menuItems = store.menuItems.filter((i) => i.id !== req.params.id);
    if (store.menuItems.length === before) {
      res.status(404).json({ error: 'Menu item not found.' });
      return;
    }
    writeStore(store);
    res.json({ ok: true });
  });

  app.patch('/api/admin/cakes/:id', requireAdmin, (req, res) => {
    const parsed = cakeCollectionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid cake update.' });
      return;
    }
    const store = readStore();
    const idx = store.cakeCollections.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Cake collection not found.' });
      return;
    }
    const updated: CakeCollection = {
      ...store.cakeCollections[idx],
      ...parsed.data,
    };
    store.cakeCollections[idx] = updated;
    writeStore(store);
    res.json({ collection: updated });
  });

  app.patch('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
    const schema = z.object({
      status: z.enum(['New', 'Reviewed', 'Confirmed', 'Completed']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }
    const store = readStore();
    const idx = store.enquiries.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }
    store.enquiries[idx].status = parsed.data.status;
    writeStore(store);
    res.json({ enquiry: store.enquiries[idx] });
  });

  app.post('/api/admin/gallery', requireAdmin, (req, res) => {
    const parsed = galleryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid gallery item.' });
      return;
    }
    const store = readStore();
    const item: GalleryItem = {
      id: `gal-${Date.now().toString(36)}`,
      ...parsed.data,
    };
    store.gallery.unshift(item);
    writeStore(store);
    res.status(201).json({ item });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const before = store.gallery.length;
    store.gallery = store.gallery.filter((g) => g.id !== req.params.id);
    if (store.gallery.length === before) {
      res.status(404).json({ error: 'Gallery item not found.' });
      return;
    }
    writeStore(store);
    res.json({ ok: true });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid settings.' });
      return;
    }
    const store = readStore();
    store.settings = parsed.data;
    writeStore(store);
    res.json({ settings: store.settings });
  });

  // Mount Vite in dev or serve built assets in production
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`7th Heaven Bakery & Cafe server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
