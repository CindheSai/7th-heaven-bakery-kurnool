/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { BakeryProvider, useBakery } from './context/BakeryContext.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { CakesPage } from './pages/CakesPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';

const AdminPage = lazy(() =>
  import('./pages/AdminPage.tsx').then((mod) => ({ default: mod.AdminPage }))
);

const ROUTE_TITLES: Record<string, string> = {
  '/': '7th Heaven Bakery & Cafe – Pure Veg Bakery & Cakes in Kurnool',
  '/menu': 'Menu – Savouries, Sips & Sweet Side | 7th Heaven Bakery & Cafe Kurnool',
  '/cakes': 'Celebration & Custom Cakes | 7th Heaven Bakery & Cafe Kurnool',
  '/gallery': 'Gallery | 7th Heaven Bakery & Cafe Kurnool',
  '/about': 'About Us | 7th Heaven Bakery & Cafe Kurnool',
  '/contact': 'Contact & Location | Gandhi Nagar, Kurnool – 7th Heaven Bakery & Cafe',
  '/cart': 'Order Bag | 7th Heaven Bakery & Cafe Kurnool',
  '/admin': 'Store Admin | 7th Heaven Bakery & Cafe',
};

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (!pathname.startsWith('/product/')) {
      document.title =
        ROUTE_TITLES[pathname] ||
        '7th Heaven Bakery & Cafe – Pure Veg Bakery & Cakes in Kurnool';
    }
  }, [pathname]);
  return null;
}

function ToastBanner() {
  const { lastAddedNotice, setIsCartOpen } = useBakery();
  if (!lastAddedNotice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-40 max-w-sm bg-[#28231F] text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-3 text-xs font-medium"
    >
      <span className="truncate">{lastAddedNotice}</span>
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="text-[#F36B21] hover:text-white font-semibold whitespace-nowrap shrink-0 underline underline-offset-2"
      >
        View Bag
      </button>
    </div>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <p className="text-sm text-[#81766D]">Loading...</p>
    </div>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#28231F]">
      <RouteEffects />
      <Navbar />
      <div className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cakes" element={<CakesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <ToastBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BakeryProvider>
        <AppShell />
      </BakeryProvider>
    </BrowserRouter>
  );
}
