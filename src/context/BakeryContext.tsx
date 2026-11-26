import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_STORE_DATA } from '../data/seedData.ts';
import type {
  CakeCollection,
  CartItem,
  GalleryItem,
  MenuItem,
  SiteSettings,
} from '../types/bakery.ts';

interface BakeryContextValue {
  settings: SiteSettings;
  menuItems: MenuItem[];
  cakeCollections: CakeCollection[];
  gallery: GalleryItem[];
  loading: boolean;
  refreshStore: () => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  addToCart: (item: MenuItem, variantLabel?: string, unitPrice?: number) => void;
  updateQuantity: (cartKey: string, delta: number) => void;
  removeFromCart: (cartKey: string) => void;
  clearCart: () => void;
  lastAddedNotice: string | null;
}

const BakeryContext = createContext<BakeryContextValue | null>(null);

const CART_STORAGE_KEY = '7th_heaven_kurnool_cart_v1';

export function BakeryProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_STORE_DATA.settings);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_STORE_DATA.menuItems);
  const [cakeCollections, setCakeCollections] = useState<CakeCollection[]>(
    INITIAL_STORE_DATA.cakeCollections
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_STORE_DATA.gallery);
  const [loading, setLoading] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastAddedNotice, setLastAddedNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const refreshStore = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.menuItems)) setMenuItems(data.menuItems);
        if (Array.isArray(data.cakeCollections)) setCakeCollections(data.cakeCollections);
        if (Array.isArray(data.gallery)) setGallery(data.gallery);
      }
    } catch {
      // Keep initial seed data if API is temporarily unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStore();
  }, [refreshStore]);

  const addToCart = useCallback(
    (item: MenuItem, variantLabel?: string, overridePrice?: number) => {
      const resolvedPrice =
        overridePrice ??
        (variantLabel
          ? item.variants?.find((v) => v.label === variantLabel)?.price
          : item.price) ??
        item.variants?.[0]?.price ??
        0;
      if (resolvedPrice <= 0 || !item.available) return;

      const resolvedLabel = variantLabel || item.variants?.[0]?.label;
      const cartKey = resolvedLabel ? `${item.id}::${resolvedLabel}` : item.id;

      setCart((prev) => {
        const existing = prev.find((c) => c.cartKey === cartKey);
        if (existing) {
          return prev.map((c) =>
            c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
        return [
          ...prev,
          {
            cartKey,
            itemId: item.id,
            name: item.name,
            category: item.category,
            variantLabel: resolvedLabel,
            unitPrice: resolvedPrice,
            quantity: 1,
          },
        ];
      });

      const labelText = resolvedLabel ? `${item.name} (${resolvedLabel})` : item.name;
      setLastAddedNotice(`Added ${labelText} to your order bag`);
      window.setTimeout(() => {
        setLastAddedNotice((current) =>
          current === `Added ${labelText} to your order bag` ? null : current
        );
      }, 2400);
    },
    []
  );

  const updateQuantity = useCallback((cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((cartKey: string) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const value = useMemo<BakeryContextValue>(
    () => ({
      settings,
      menuItems,
      cakeCollections,
      gallery,
      loading,
      refreshStore,
      cart,
      cartCount,
      cartSubtotal,
      isCartOpen,
      setIsCartOpen,
      isSearchOpen,
      setIsSearchOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      lastAddedNotice,
    }),
    [
      settings,
      menuItems,
      cakeCollections,
      gallery,
      loading,
      refreshStore,
      cart,
      cartCount,
      cartSubtotal,
      isCartOpen,
      isSearchOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      lastAddedNotice,
    ]
  );

  return <BakeryContext.Provider value={value}>{children}</BakeryContext.Provider>;
}

export function useBakery(): BakeryContextValue {
  const ctx = useContext(BakeryContext);
  if (!ctx) {
    throw new Error('useBakery must be used inside BakeryProvider');
  }
  return ctx;
}
