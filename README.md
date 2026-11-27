# 7th Heaven Bakery & Cafe — Production Web Application

**Location:** 40/337, Gandhi Nagar, Kurnool, Andhra Pradesh 518001, India  
**Hours:** 10:00 AM – 10:00 PM (Daily)  
**Phone / WhatsApp:** 8885011611  
**Instagram:** @7thheaven_kurnool  
**Positioning:** 100% Pure Vegetarian

---

## Architecture & Project Structure

```
├── index.html                    # SEO metadata, OpenGraph, Bakery JSON-LD, favicon, Google Fonts
├── server.ts                     # Express API, health-check, upload/static serving, Vite dev / prod SPA
├── server/
│   ├── auth.ts                   # scrypt password hashing, first-run claim, HttpOnly HMAC session cookie + Bearer
│   ├── store.ts                  # Dual storage engine: PostgreSQL (DATABASE_URL) or atomic JSON (DATA_DIR)
│   ├── data/store.json           # Local runtime JSON store (gitignored; seeded automatically on first start)
│   └── uploads/                  # Local uploaded images (gitignored; stored in DB when DATABASE_URL is set)
├── database/
│   └── schema.sql                # PostgreSQL relational schema (auto-applied on boot when DATABASE_URL is set)
├── public/
│   ├── favicon.svg               # Brand favicon
│   ├── robots.txt
│   ├── sitemap.xml               # Static fallback; server.ts also serves dynamic /sitemap.xml
│   └── assets/                   # Authentic Kurnool outlet gallery photos & original cake menu sheet
├── src/
│   ├── main.tsx                  # React 19 createRoot + StrictMode + top-level ErrorBoundary
│   ├── App.tsx                   # Routes: /, /menu, /product/:id, /cakes, /gallery, /about, /contact, /cart, /admin
│   ├── index.css                 # Tailwind CSS v4 theme & typography tokens
│   ├── types/bakery.ts           # Domain TypeScript interfaces
│   ├── data/seedData.ts          # 162-item café menu & 13 cake collections + authentic gallery seed
│   ├── context/BakeryContext.tsx # Store bootstrap, hydration-safe cart persistence, search/drawer state
│   ├── components/
│   │   ├── BrandMark.tsx         # BrandLogoIcon, VegMark, SafeImage
│   │   ├── ErrorBoundary.tsx     # Graceful recovery boundary (prevents white screens)
│   │   ├── Navbar.tsx            # Sticky responsive header + mobile drawer
│   │   ├── CartDrawer.tsx        # Slide-over order bag
│   │   ├── SearchModal.tsx       # Live global search across menu & cakes
│   │   ├── MenuItemCard.tsx      # Item card with image, size variant selector & detail link
│   │   ├── HeroPatisserie3D.tsx  # Lazy-loaded Three.js 3D patisserie centerpiece
│   │   └── Footer.tsx
│   └── pages/
│       ├── HomePage.tsx
│       ├── MenuPage.tsx
│       ├── ProductDetailPage.tsx
│       ├── CakesPage.tsx
│       ├── GalleryPage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       ├── CartPage.tsx
│       └── AdminPage.tsx         # Lazy-loaded protected admin console
```

---

## Environment Variables (`.env.example`)

- `PORT` — HTTP port (default `3000`; Railway/Render inject automatically).
- `NODE_ENV` — `development` or `production`.
- `APP_URL` — Public site URL for `/sitemap.xml`.
- `DATABASE_URL` — PostgreSQL connection string (recommended for Railway/Render/Supabase). Automatically creates tables from `database/schema.sql`, seeds initial data on first boot, and stores uploaded images in `uploaded_files`.
- `DATABASE_SSL` — Optional override (`true` / `false`). Auto-enabled for remote `DATABASE_URL`.
- `DATA_DIR` — Optional directory for local JSON persistence & uploads (useful when mounting a persistent disk at `/data` without PostgreSQL).
- `ADMIN_PASSCODE` — Optional preset admin passcode. If omitted, `/admin` presents a one-time **Owner Setup** form that stores a salted `scrypt` hash in the database/store.
- `SESSION_SECRET` — HMAC secret for signing admin session cookies/tokens (recommended in production).

---

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Quality Checks & Production Build

```bash
npm run lint    # TypeScript type-check (tsc --noEmit)
npm run build   # Builds frontend into dist/ and bundles server into dist-server/server.mjs
npm start       # Starts production server on 0.0.0.0:$PORT
```

---

## Production Deployment

### Railway
1. Connect your repository to Railway and add a **PostgreSQL** service (or attach a Volume at `/data` and set `DATA_DIR=/data`).
2. Set environment variables in Railway:
   - `NODE_ENV=production`
   - `DATABASE_URL` (auto-linked from Railway Postgres)
   - `SESSION_SECRET` (random 32+ character string)
   - `ADMIN_PASSCODE` (optional, or claim via `/admin` after first deploy)
   - `APP_URL` (your Railway public URL)
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Healthcheck path: `/api/health`

### Render
1. Create a new **Web Service** connected to your repository (Environment: **Node**).
2. Add a **Render PostgreSQL** database (or attach a Persistent Disk at `/data` and set `DATA_DIR=/data`).
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Health Check Path: `/api/health`
6. Set environment variables: `NODE_ENV=production`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSCODE` (optional), `APP_URL`.
