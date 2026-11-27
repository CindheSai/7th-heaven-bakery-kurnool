import crypto from 'crypto';
import 'dotenv/config';
import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import {
  claimAdminPassword,
  clearAdminSessionCookie,
  createAdminToken,
  getAuthStatus,
  requireAdmin,
  setAdminSessionCookie,
  verifyAdminPassword,
} from './server/auth.ts';
import {
  addContactMessage,
  addEnquiry,
  addGalleryItem,
  addMenuItem,
  addOrder,
  checkStorageHealth,
  deleteGalleryItem,
  deleteMenuItem,
  getAdminDashboardData,
  getPublicStore,
  getStorageMode,
  initStorage,
  readUploadedFile,
  renameMenuCategory,
  saveUploadedFile,
  updateCakeCollection,
  updateContactStatus,
  updateEnquiryStatus,
  updateMenuItem,
  updateOrderStatus,
  updateSettings,
} from './server/store.ts';
import type {
  CakeEnquiry,
  ContactMessage,
  GalleryItem,
  MenuItem,
  OrderRequest,
} from './src/types/bakery.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD =
  process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function createRateLimiter(windowMs: number, maxHits: number): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const current = hits.get(key);
    if (!current || now > current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxHits) {
      const retrySec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retrySec));
      res.status(429).json({
        error: `Too many requests. Please try again in ${retrySec} seconds.`,
      });
      return;
    }
    current.count += 1;
    next();
  };
}

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
  .refine(isSafeUrl, {
    message: 'Only safe relative paths or http/https URLs are permitted.',
  });

const menuVariantSchema = z.object({
  label: z.string().trim().min(1).max(40),
  price: z.number().int().min(1).max(100000),
});

const menuItemCreateSchema = z
  .object({
    id: z.string().trim().min(1).max(120).optional(),
    name: z.string().trim().min(1).max(120),
    section: z.enum(['Savouries & Sips', 'Sweet Side']),
    category: z.string().trim().min(1).max(80),
    price: z.number().int().min(1).max(100000).optional(),
    variants: z.array(menuVariantSchema).min(1).max(6).optional(),
    unitNote: z.string().trim().max(120).optional(),
    isVeg: z.boolean().default(true),
    available: z.boolean().default(true),
    image: safeUrlSchema.optional(),
    description: z.string().trim().max(400).optional(),
  })
  .refine((v) => typeof v.price === 'number' || (v.variants && v.variants.length > 0), {
    message: 'Provide either a price or at least one size variant.',
  });

const menuItemUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  section: z.enum(['Savouries & Sips', 'Sweet Side']).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  price: z.number().int().min(1).max(100000).nullable().optional(),
  variants: z.array(menuVariantSchema).min(1).max(6).nullable().optional(),
  unitNote: z.string().trim().max(120).nullable().optional(),
  isVeg: z.boolean().optional(),
  available: z.boolean().optional(),
  image: safeUrlSchema.nullable().optional(),
  description: z.string().trim().max(400).nullable().optional(),
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
  priceVerificationStatus: z
    .enum(['verified', 'needs_verification', 'custom_quote'])
    .optional(),
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
  image: safeUrlSchema.refine((v) => v.length > 0, {
    message: 'Image URL is required.',
  }),
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

const orderCreateSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your name').max(100),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, 'Please enter a valid 10-digit mobile number'),
  fulfillment: z.enum(['Store Pickup', 'Local Delivery Enquiry']),
  items: z
    .array(
      z.object({
        itemId: z.string().trim().min(1).max(120),
        variantLabel: z.string().trim().max(40).optional(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'Your order bag is empty.')
    .max(50),
  notes: z.string().trim().max(500).optional(),
});

const contactCreateSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, 'Please enter a valid mobile number'),
  email: z
    .union([z.string().trim().email('Please enter a valid email address').max(120), z.literal('')])
    .optional(),
  subject: z.string().trim().min(2, 'Please enter a subject').max(120),
  message: z.string().trim().min(10, 'Please share a bit more detail (at least 10 characters).').max(1500),
});

const uploadImageSchema = z.object({
  dataUrl: z.string().min(30).max(7_200_000),
});

async function startServer(): Promise<void> {
  await initStorage();

  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  const authRateLimit = createRateLimiter(15 * 60 * 1000, 25);
  const publicWriteRateLimit = createRateLimiter(10 * 60 * 1000, 40);

  // Health-check endpoint for Railway / Render / uptime monitors
  const healthHandler = asyncHandler(async (_req, res) => {
    const healthy = await checkStorageHealth();
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      storage: getStorageMode(),
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });
  app.get('/api/health', healthHandler);
  app.get('/healthz', healthHandler);

  // Safely serve uploaded images (from local/volume disk or PostgreSQL)
  app.get(
    '/uploads/:filename',
    asyncHandler(async (req, res) => {
      const rawName = path.basename(String(req.params.filename || ''));
      if (!/^[a-zA-Z0-9._-]+$/.test(rawName)) {
        res.status(400).json({ error: 'Invalid filename.' });
        return;
      }
      const file = await readUploadedFile(rawName);
      if (!file) {
        res.status(404).json({ error: 'File not found.' });
        return;
      }
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (file.filePath) {
        res.sendFile(file.filePath);
        return;
      }
      res.type(file.mimeType).send(file.buffer);
    })
  );

  // Public bootstrap data
  app.get(
    '/api/bootstrap',
    asyncHandler(async (_req, res) => {
      const data = await getPublicStore();
      res.setHeader('Cache-Control', 'no-store');
      res.json(data);
    })
  );

  // Public cake reference image upload
  app.post(
    '/api/enquiries/upload',
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = uploadImageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid image payload.' });
        return;
      }
      const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
        parsed.data.dataUrl
      );
      if (!match) {
        res
          .status(400)
          .json({ error: 'Only JPEG, PNG, or WebP images are supported.' });
        return;
      }
      const [, mime, b64] = match;
      const buffer = Buffer.from(b64, 'base64');
      if (buffer.byteLength > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'Image must be smaller than 5 MB.' });
        return;
      }
      const ext =
        mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const filename = `ref-${crypto.randomUUID()}.${ext}`;
      await saveUploadedFile(filename, mime, buffer);
      res.status(201).json({ url: `/uploads/${filename}` });
    })
  );

  // Public custom cake enquiry submission
  app.post(
    '/api/enquiries',
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = cakeEnquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid enquiry details.',
        });
        return;
      }
      const enquiry: CakeEnquiry = {
        id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
        ...parsed.data,
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      const saved = await addEnquiry(enquiry);
      res.status(201).json({ enquiry: saved });
    })
  );

  // Public order request submission (authoritative server-side price lookup)
  app.post(
    '/api/orders',
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = orderCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid order request.',
        });
        return;
      }
      const pubStore = await getPublicStore();
      const menuMap = new Map(pubStore.menuItems.map((m) => [m.id, m]));
      const verifiedItems: OrderRequest['items'] = [];
      let estimatedSubtotal = 0;

      for (const reqItem of parsed.data.items) {
        const menuEntry = menuMap.get(reqItem.itemId);
        if (!menuEntry) {
          res.status(400).json({
            error: 'One or more items in your bag are no longer on the menu. Please refresh.',
          });
          return;
        }
        if (!menuEntry.available) {
          res.status(409).json({
            error: `"${menuEntry.name}" is currently marked unavailable. Please remove it from your bag.`,
          });
          return;
        }
        let unitPrice = menuEntry.price ?? 0;
        let variantLabel = reqItem.variantLabel;
        if (menuEntry.variants && menuEntry.variants.length > 0) {
          const matchedVariant =
            menuEntry.variants.find((v) => v.label === reqItem.variantLabel) ??
            menuEntry.variants[0];
          unitPrice = matchedVariant.price;
          variantLabel = matchedVariant.label;
        }
        if (unitPrice <= 0) {
          res.status(400).json({
            error: `Unable to determine verified price for "${menuEntry.name}".`,
          });
          return;
        }
        estimatedSubtotal += unitPrice * reqItem.quantity;
        verifiedItems.push({
          itemId: menuEntry.id,
          name: menuEntry.name,
          category: menuEntry.category,
          variantLabel,
          unitPrice,
          quantity: reqItem.quantity,
        });
      }

      const order: OrderRequest = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        customerName: parsed.data.customerName,
        mobileNumber: parsed.data.mobileNumber,
        fulfillment: parsed.data.fulfillment,
        items: verifiedItems,
        estimatedSubtotal,
        notes: parsed.data.notes || undefined,
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      const saved = await addOrder(order);
      res.status(201).json({ order: saved });
    })
  );

  // Public contact / general enquiry submission
  app.post(
    '/api/contact',
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = contactCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Please check your contact form details.',
        });
        return;
      }
      const msg: ContactMessage = {
        id: `MSG-${Date.now().toString(36).toUpperCase()}`,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || undefined,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      const saved = await addContactMessage(msg);
      res.status(201).json({ contact: saved });
    })
  );

  // Admin auth status & login/claim/logout routes
  app.get(
    '/api/admin/auth-status',
    asyncHandler(async (req, res) => {
      const status = await getAuthStatus(req);
      res.json(status);
    })
  );

  app.post(
    '/api/admin/claim',
    authRateLimit,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        password: z
          .string()
          .min(8, 'Admin password must be at least 8 characters.')
          .max(128),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid password.',
        });
        return;
      }
      const result = await claimAdminPassword(parsed.data.password);
      if (!result.ok) {
        res.status(409).json({ error: result.error });
        return;
      }
      const token = await createAdminToken();
      setAdminSessionCookie(req, res, token);
      res.status(201).json({ ok: true, token });
    })
  );

  app.post(
    '/api/admin/login',
    authRateLimit,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        password: z.string().min(1).max(128),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Password is required.' });
        return;
      }
      const ok = await verifyAdminPassword(parsed.data.password);
      if (!ok) {
        res.status(401).json({ error: 'Incorrect admin passcode.' });
        return;
      }
      const token = await createAdminToken();
      setAdminSessionCookie(req, res, token);
      res.json({ ok: true, token });
    })
  );

  app.post('/api/admin/logout', (_req, res) => {
    clearAdminSessionCookie(res);
    res.json({ ok: true });
  });

  // Protected admin dashboard data & mutations
  app.get(
    '/api/admin/dashboard',
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const data = await getAdminDashboardData();
      res.json({
        ...data,
        storageMode: getStorageMode(),
      });
    })
  );

  app.post(
    '/api/admin/menu',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = menuItemCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid menu item.',
        });
        return;
      }
      const id =
        parsed.data.id ||
        `custom-${parsed.data.category}-${parsed.data.name}-${Date.now().toString(36)}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
      const newItem: MenuItem = {
        ...parsed.data,
        id,
      };
      const saved = await addMenuItem(newItem);
      res.status(201).json({ item: saved });
    })
  );

  app.patch(
    '/api/admin/menu/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = menuItemUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid update.',
        });
        return;
      }
      const patch: Partial<MenuItem> = {};
      if (parsed.data.name !== undefined) patch.name = parsed.data.name;
      if (parsed.data.section !== undefined) patch.section = parsed.data.section;
      if (parsed.data.category !== undefined) patch.category = parsed.data.category;
      if (parsed.data.price !== undefined) patch.price = parsed.data.price ?? undefined;
      if (parsed.data.variants !== undefined) patch.variants = parsed.data.variants ?? undefined;
      if (parsed.data.unitNote !== undefined) patch.unitNote = parsed.data.unitNote ?? undefined;
      if (parsed.data.isVeg !== undefined) patch.isVeg = parsed.data.isVeg;
      if (parsed.data.available !== undefined) patch.available = parsed.data.available;
      if (parsed.data.image !== undefined) patch.image = parsed.data.image ?? undefined;
      if (parsed.data.description !== undefined) patch.description = parsed.data.description ?? undefined;

      const updated = await updateMenuItem(String(req.params.id), patch);
      if (!updated) {
        res.status(404).json({ error: 'Menu item not found.' });
        return;
      }
      res.json({ item: updated });
    })
  );

  app.delete(
    '/api/admin/menu/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const deleted = await deleteMenuItem(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Menu item not found.' });
        return;
      }
      res.json({ ok: true });
    })
  );

  app.post(
    '/api/admin/categories/rename',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        section: z.enum(['Savouries & Sips', 'Sweet Side']),
        fromCategory: z.string().trim().min(1).max(80),
        toCategory: z.string().trim().min(1).max(80),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid category rename payload.' });
        return;
      }
      const updatedCount = await renameMenuCategory(
        parsed.data.section,
        parsed.data.fromCategory,
        parsed.data.toCategory
      );
      if (updatedCount === 0) {
        res.status(404).json({ error: 'No items found in that category.' });
        return;
      }
      res.json({ ok: true, updatedCount });
    })
  );

  app.patch(
    '/api/admin/cakes/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = cakeCollectionUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid cake update.',
        });
        return;
      }
      const updated = await updateCakeCollection(String(req.params.id), parsed.data);
      if (!updated) {
        res.status(404).json({ error: 'Cake collection not found.' });
        return;
      }
      res.json({ collection: updated });
    })
  );

  app.patch(
    '/api/admin/enquiries/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(['New', 'Reviewed', 'Confirmed', 'Completed']),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid status.' });
        return;
      }
      const updated = await updateEnquiryStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Enquiry not found.' });
        return;
      }
      res.json({ enquiry: updated });
    })
  );

  app.patch(
    '/api/admin/orders/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(['New', 'Confirmed', 'Ready', 'Completed', 'Cancelled']),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }
      const updated = await updateOrderStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Order request not found.' });
        return;
      }
      res.json({ order: updated });
    })
  );

  app.patch(
    '/api/admin/contacts/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(['New', 'Replied', 'Resolved']),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid contact message status.' });
        return;
      }
      const updated = await updateContactStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Contact message not found.' });
        return;
      }
      res.json({ contact: updated });
    })
  );

  app.post(
    '/api/admin/gallery',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = galleryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid gallery item.',
        });
        return;
      }
      const item: GalleryItem = {
        id: `gal-${Date.now().toString(36)}`,
        ...parsed.data,
      };
      const saved = await addGalleryItem(item);
      res.status(201).json({ item: saved });
    })
  );

  app.delete(
    '/api/admin/gallery/:id',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const deleted = await deleteGalleryItem(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Gallery item not found.' });
        return;
      }
      res.json({ ok: true });
    })
  );

  app.put(
    '/api/admin/settings',
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = settingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid settings.',
        });
        return;
      }
      const saved = await updateSettings(parsed.data);
      res.json({ settings: saved });
    })
  );

  // Dynamic sitemap.xml using configured APP_URL or request host
  app.get('/sitemap.xml', (req, res) => {
    const envUrl = process.env.APP_URL?.trim();
    const baseUrl =
      envUrl && !envUrl.includes('MY_APP_URL') && !envUrl.includes('example.com')
        ? envUrl.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;
    const routes = [
      { path: '/', priority: '1.0' },
      { path: '/menu', priority: '0.9' },
      { path: '/cakes', priority: '0.9' },
      { path: '/gallery', priority: '0.7' },
      { path: '/about', priority: '0.7' },
      { path: '/contact', priority: '0.8' },
      { path: '/cart', priority: '0.5' },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => `  <url><loc>${baseUrl}${r.path}</loc><priority>${r.priority}</priority></url>`)
  .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
  });

  // Never swallow unknown /api/* or /uploads/* routes into SPA fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });
  app.all('/uploads/*', (_req, res) => {
    res.status(404).json({ error: 'File not found.' });
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
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
      throw new Error(
        `Production frontend build missing at ${distDir}. Run "npm run build" before starting.`
      );
    }
    app.use(
      '/assets',
      express.static(path.join(distDir, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    app.use(
      express.static(distDir, {
        maxAge: '1h',
        index: false,
      })
    );
    app.all('/assets/*', (_req, res) => {
      res.status(404).type('text/plain').send('Asset not found.');
    });
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Centralized error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof err === 'object' &&
      err !== null &&
      ('statusCode' in err || 'status' in err)
        ? Number((err as { statusCode?: number; status?: number }).statusCode || (err as { status?: number }).status)
        : 500;
    if (status >= 500) {
      console.error('[server error]', err);
    }
    if (res.headersSent) return;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error:
        status === 400
          ? 'Malformed request payload.'
          : status === 404
            ? 'Resource not found.'
            : 'An unexpected server error occurred. Please try again.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `7th Heaven Bakery & Cafe server (${IS_PROD ? 'production' : 'development'}, storage=${getStorageMode()}) listening on 0.0.0.0:${PORT}`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
