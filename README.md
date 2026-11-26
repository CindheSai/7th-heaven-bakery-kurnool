# 7th Heaven Bakery & Cafe — Digital Experience

**Location:** 40/337, Gandhi Nagar, Kurnool, Andhra Pradesh 518001, India  
**Hours:** 10:00 AM – 10:00 PM  
**Phone / WhatsApp:** 8885011611  
**Instagram:** @7thheaven_kurnool  
**Positioning:** 100% Pure Vegetarian

---

## Project Structure

```
├── index.html                  # SEO meta, OpenGraph, Bakery JSON-LD, Google Fonts
├── server.ts                   # Express full-stack server + Vite middleware + API routes
├── server/
│   ├── auth.ts                 # scrypt password hashing, first-run claim, HMAC Bearer tokens
│   ├── store.ts                # Atomic JSON persistence (server/data/store.json) & uploads dir
│   └── data/store.json         # Runtime persisted data (seeded automatically on first start)
├── database/
│   └── schema.sql              # PostgreSQL / Supabase relational DDL for cloud DB migration
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/aistudio/        # Uploaded cake menu photograph & official PDF menu
├── src/
│   ├── App.tsx                 # Routes: /, /menu, /cakes, /gallery, /about, /contact, /cart, /admin
│   ├── index.css               # Tailwind CSS v4 theme & typography tokens
│   ├── types/bakery.ts         # Domain TypeScript interfaces
│   ├── data/seedData.ts        # Complete 162-item café menu & 13 cake collections
│   ├── context/BakeryContext.tsx
│   ├── components/
│   │   ├── BrandMark.tsx       # 7th Heaven SVG mark, Pure Veg indicator, SafeImage fallback
│   │   ├── Navbar.tsx          # Sticky 3-zone header + mobile drawer
│   │   ├── CartDrawer.tsx      # Slide-over order bag
│   │   ├── SearchModal.tsx     # Live global search across menu & cakes
│   │   ├── MenuItemCard.tsx    # Item card with 6"/8" pizza size selector & INR pricing
│   │   ├── HeroPatisserie3D.tsx# Interactive Three.js 3D patisserie centerpiece
│   │   └── Footer.tsx
│   └── pages/
│       ├── HomePage.tsx
│       ├── MenuPage.tsx
│       ├── CakesPage.tsx
│       ├── GalleryPage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       ├── CartPage.tsx
│       └── AdminPage.tsx
```

---

## Environment Variables (`.env.example`)

- `PORT` — HTTP port (defaults to `3000`).
- `ADMIN_PASSCODE` — Optional server-side passcode for `/admin`. If left unset, visiting `/admin` presents a one-time **Owner Setup / Claim Password** form stored as a salted `scrypt` hash on the server.
- `SESSION_SECRET` — Optional HMAC secret for admin Bearer tokens (falls back to secure in-memory random bytes).

---

## Running & Deployment

1. **Development:** `npm run dev` (starts Express + Vite on port 3000)
2. **Type-check:** `npm run lint`
3. **Production Build:** `npm run build`
4. **Production Start:** `NODE_ENV=production npm start`
5. **Database Migration:** Apply `database/schema.sql` if migrating from `server/data/store.json` to PostgreSQL/Supabase.

---

## Remaining Business Items to Verify Before Live Launch

1. **Printed Cake Menu Price Clarifications:** In the uploaded cake menu photograph, a few printed prices have minor glare/low contrast and are flagged in `/cakes` and `/admin` (`Classic Cakes` Half KG ₹350, `Premium Cakes` Pastry ₹85, `Premium Exotic` Half KG ₹550, `Pie Cakes` Half KG ₹650 / 1 KG ₹1280, `No-Bake Cheesecakes` Half KG ₹585 / Pastry ₹95, `Photo Cake` Half KG ₹655). Confirm and update them in `/admin`.
2. **No-Bake Cheesecake Pastry vs Café Slice:** The cake menu card prints `Pastry (120gms) ₹95` while the café Sweet Side menu lists `No Bake Cheesecakes ₹135`. Confirm whether those represent different portion sizes or an updated price.
3. **Authentic Café & Product Photography:** Current gallery and showcase images are clearly labelled as representative patisserie imagery. Upload real photos of the Gandhi Nagar storefront, café seating, and signature cakes via `/admin` → **Gallery**.
4. **Vector Brand Logo:** A clean geometric SVG brand mark is used; replace or refine with the official print-ready vector file if available.
