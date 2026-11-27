import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBakery } from '../context/BakeryContext.tsx';
import type {
  CakeCollection,
  CakeEnquiry,
  ContactMessage,
  GalleryItem,
  MenuItem,
  MenuSection,
  MenuVariant,
  OrderRequest,
  SiteSettings,
} from '../types/bakery.ts';

type AdminTab =
  | 'overview'
  | 'menu'
  | 'cakes'
  | 'orders'
  | 'enquiries'
  | 'contacts'
  | 'gallery'
  | 'settings';

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export function AdminPage() {
  const { refreshStore } = useBakery();

  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    configured: boolean;
    mode: 'env_passcode' | 'claimed_password' | 'claim_required';
    authenticated: boolean;
  }>({ loading: true, configured: false, mode: 'claim_required', authenticated: false });

  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'postgres' | 'json'>('json');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cakeCollections, setCakeCollections] = useState<CakeCollection[]>([]);
  const [enquiries, setEnquiries] = useState<CakeEnquiry[]>([]);
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Menu filter & add state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuSection, setNewMenuSection] = useState<MenuSection>('Sweet Side');
  const [newMenuCategory, setNewMenuCategory] = useState('Brownies');
  const [newMenuPrice, setNewMenuPrice] = useState('100');
  const [newMenuImage, setNewMenuImage] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');

  // Menu item edit modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editHasVariants, setEditHasVariants] = useState(false);
  const [editVariants, setEditVariants] = useState<MenuVariant[]>([]);

  // Category rename state
  const [renameSection, setRenameSection] = useState<MenuSection>('Sweet Side');
  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');

  // Gallery quick-add state
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCat, setNewGalCat] = useState<GalleryItem['category']>('Café Experience');
  const [newGalImage, setNewGalImage] = useState('');
  const [newGalCaption, setNewGalCaption] = useState('');
  const [newGalAuthentic, setNewGalAuthentic] = useState(true);

  const notify = (msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth-status', {
        credentials: 'same-origin',
      });
      const data = await res.json();
      const isAuthed = Boolean(data.authenticated);
      setAuthStatus({
        loading: false,
        configured: Boolean(data.configured),
        mode: data.mode || 'claim_required',
        authenticated: isAuthed,
      });
      if (isAuthed) {
        setAuthenticated(true);
      }
    } catch {
      setAuthStatus({
        loading: false,
        configured: false,
        mode: 'claim_required',
        authenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    void fetchAuthStatus();
  }, [fetchAuthStatus]);

  const loadDashboard = useCallback(async (authToken?: string | null) => {
    setLoadingDash(true);
    setDashError(null);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/dashboard', {
        credentials: 'same-origin',
        headers,
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setToken(null);
        throw new Error('Admin session expired. Please sign in again.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard.');
      setMenuItems(data.menuItems || []);
      setCakeCollections(data.cakeCollections || []);
      setEnquiries(data.enquiries || []);
      setOrders(data.orders || []);
      setContacts(data.contacts || []);
      setGallery(data.gallery || []);
      setSettings(data.settings || null);
      if (data.storageMode === 'postgres' || data.storageMode === 'json') {
        setStorageMode(data.storageMode);
      }
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      void loadDashboard(token);
    }
  }, [authenticated, token, loadDashboard]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthBusy(true);
    try {
      const res = await fetch('/api/admin/claim', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim admin access.');
      setToken(data.token || null);
      setAuthenticated(true);
      setPasswordInput('');
      setConfirmPasswordInput('');
      await fetchAuthStatus();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Claim failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid passcode.');
      setToken(data.token || null);
      setAuthenticated(true);
      setPasswordInput('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // ignore network error on logout
    } finally {
      setAuthenticated(false);
      setToken(null);
    }
  };

  const authedFetch = async (url: string, init: RequestInit) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      ...init,
      credentials: 'same-origin',
      headers,
    });
    const data = await res.json();
    if (res.status === 401) {
      setAuthenticated(false);
      setToken(null);
      throw new Error('Session expired. Please sign in again.');
    }
    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Only JPEG, PNG, or WebP images are supported.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5 MB.');
    }
    const dataUrl = await fileToDataUrl(file);
    const res = await fetch('/api/enquiries/upload', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
    return String(data.url);
  };

  // Menu Actions
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const data = await authedFetch(`/api/admin/menu/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ available: !item.available }),
      });
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? data.item : m)));
      await refreshStore();
      notify(`Updated ${item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(newMenuPrice);
    if (
      !newMenuName.trim() ||
      !newMenuCategory.trim() ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      return;
    }
    try {
      const data = await authedFetch('/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({
          name: newMenuName.trim(),
          section: newMenuSection,
          category: newMenuCategory.trim(),
          price: Math.round(parsedPrice),
          image: newMenuImage.trim() || undefined,
          description: newMenuDescription.trim() || undefined,
          isVeg: true,
          available: true,
        }),
      });
      setMenuItems((prev) => [data.item, ...prev]);
      setNewMenuName('');
      setNewMenuImage('');
      setNewMenuDescription('');
      await refreshStore();
      notify(`Added ${data.item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to add menu item.');
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem({ ...item });
    const hasVar = Boolean(item.variants && item.variants.length > 0);
    setEditHasVariants(hasVar);
    setEditVariants(
      hasVar && item.variants
        ? item.variants.map((v) => ({ ...v }))
        : [
            { label: '6-inch', price: item.price || 120 },
            { label: '8-inch', price: (item.price || 120) + 30 },
          ]
    );
  };

  const handleSaveEditedMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const payload = {
        name: editingItem.name.trim(),
        section: editingItem.section,
        category: editingItem.category.trim(),
        unitNote: editingItem.unitNote?.trim() || null,
        description: editingItem.description?.trim() || null,
        image: editingItem.image?.trim() || null,
        available: editingItem.available,
        price: editHasVariants ? null : Math.round(Number(editingItem.price) || 1),
        variants: editHasVariants
          ? editVariants.filter((v) => v.label.trim() && v.price > 0)
          : null,
      };
      const data = await authedFetch(
        `/api/admin/menu/${encodeURIComponent(editingItem.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );
      setMenuItems((prev) => prev.map((m) => (m.id === editingItem.id ? data.item : m)));
      setEditingItem(null);
      await refreshStore();
      notify(`Saved changes to ${data.item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to save menu item.');
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    try {
      await authedFetch(`/api/admin/menu/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
      await refreshStore();
      notify(`Removed ${item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFrom.trim() || !renameTo.trim()) return;
    try {
      const data = await authedFetch('/api/admin/categories/rename', {
        method: 'POST',
        body: JSON.stringify({
          section: renameSection,
          fromCategory: renameFrom.trim(),
          toCategory: renameTo.trim(),
        }),
      });
      await loadDashboard(token);
      await refreshStore();
      notify(`Renamed category across ${data.updatedCount} items`);
      setRenameFrom('');
      setRenameTo('');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Category rename failed.');
    }
  };

  // Cake Collection Update
  const handleSaveCakeCollection = async (col: CakeCollection) => {
    try {
      const data = await authedFetch(`/api/admin/cakes/${encodeURIComponent(col.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: col.description,
          image: col.image,
          halfKgPrice: col.halfKgPrice,
          oneKgPrice: col.oneKgPrice,
          pastryPrice: col.pastryPrice ?? null,
          perKgPrice: col.perKgPrice ?? null,
          priceVerificationStatus: col.priceVerificationStatus,
          verificationNote: col.verificationNote || '',
        }),
      });
      setCakeCollections((prev) =>
        prev.map((c) => (c.id === col.id ? data.collection : c))
      );
      await refreshStore();
      notify(`Saved ${col.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to save cake collection.');
    }
  };

  // Order / Enquiry / Contact Status Updates
  const handleOrderStatus = async (id: string, status: OrderRequest['status']) => {
    try {
      const data = await authedFetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      notify(`Order ${id} marked ${status}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to update order status.');
    }
  };

  const handleEnquiryStatus = async (id: string, status: CakeEnquiry['status']) => {
    try {
      const data = await authedFetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? data.enquiry : e)));
      notify(`Enquiry ${id} marked ${status}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleContactStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      const data = await authedFetch(`/api/admin/contacts/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setContacts((prev) => prev.map((c) => (c.id === id ? data.contact : c)));
      notify(`Message ${id} marked ${status}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to update message status.');
    }
  };

  // Gallery Actions
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || !newGalImage.trim() || !newGalCaption.trim()) return;
    try {
      const data = await authedFetch('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({
          title: newGalTitle.trim(),
          category: newGalCat,
          image: newGalImage.trim(),
          caption: newGalCaption.trim(),
          isAuthenticBusinessPhoto: newGalAuthentic,
        }),
      });
      setGallery((prev) => [data.item, ...prev]);
      setNewGalTitle('');
      setNewGalImage('');
      setNewGalCaption('');
      await refreshStore();
      notify('Gallery photo added');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to add gallery photo.');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await authedFetch(`/api/admin/gallery/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      setGallery((prev) => prev.filter((g) => g.id !== id));
      await refreshStore();
      notify('Gallery item removed');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to remove gallery item.');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const data = await authedFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSettings(data.settings);
      await refreshStore();
      notify('Business settings saved');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  const menuCategories = useMemo(
    () => Array.from(new Set(menuItems.map((m) => m.category))).sort(),
    [menuItems]
  );

  const filteredMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return menuItems.filter((m) => {
      if (menuCategoryFilter !== 'All' && m.category !== menuCategoryFilter) {
        return false;
      }
      if (q) {
        return (
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.section.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, menuSearch, menuCategoryFilter]);

  const unavailableCount = useMemo(
    () => menuItems.filter((m) => !m.available).length,
    [menuItems]
  );
  const pendingVerificationCount = useMemo(
    () => cakeCollections.filter((c) => c.priceVerificationStatus === 'needs_verification').length,
    [cakeCollections]
  );
  const newOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'New').length,
    [orders]
  );
  const newEnquiriesCount = useMemo(
    () => enquiries.filter((e) => e.status === 'New').length,
    [enquiries]
  );
  const newContactsCount = useMemo(
    () => contacts.filter((c) => c.status === 'New').length,
    [contacts]
  );

  // Auth Gate UI
  if (!authenticated) {
    return (
      <div className="min-h-[80vh] bg-[#FFF9F1]/60 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white border border-[#EEE7DF] p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF9F1] border border-[#EEE7DF] flex items-center justify-center text-[#F36B21]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-editorial text-3xl font-semibold text-[#28231F]">
              Store Administration
            </h1>
            <p className="text-xs text-[#81766D]">
              7th Heaven Bakery &amp; Cafe · Protected Management Console
            </p>
          </div>

          {authStatus.loading ? (
            <p className="text-sm text-center text-[#81766D] py-4">
              Checking store security...
            </p>
          ) : authStatus.mode === 'claim_required' ? (
            <form onSubmit={handleClaim} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FFF9F1] border border-[#EEE7DF] text-xs text-[#28231F] leading-relaxed">
                <strong>First-Run Owner Setup:</strong> No admin passcode is configured yet. Create your store admin password below to lock and activate the dashboard.
              </div>
              <div className="space-y-1.5">
                <label htmlFor="claim-pw" className="text-xs font-semibold text-[#28231F]">
                  New Admin Password (min 8 characters)
                </label>
                <input
                  id="claim-pw"
                  type="password"
                  required
                  minLength={8}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="claim-pw-2" className="text-xs font-semibold text-[#28231F]">
                  Confirm Password
                </label>
                <input
                  id="claim-pw-2"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                />
              </div>
              {authError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                {authBusy ? 'Claiming...' : 'Set Admin Password & Enter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-pw" className="text-xs font-semibold text-[#28231F]">
                  Admin Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#81766D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-pw"
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                </div>
              </div>
              {authError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                {authBusy ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF9F1]/40 min-h-screen">
      {/* Admin Top Bar */}
      <div className="bg-white border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
              7th Heaven Bakery &amp; Cafe · Storage: {storageMode.toUpperCase()}
            </p>
            <h1 className="font-editorial text-3xl font-semibold text-[#28231F]">
              Store Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard(token)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EEE7DF] bg-white hover:border-[#F36B21] text-xs font-semibold text-[#28231F]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#28231F] text-xs font-semibold text-[#28231F] hover:bg-[#28231F] hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-3">
          {(
            [
              ['overview', 'Overview'],
              ['menu', `Menu Items (${menuItems.length})`],
              ['cakes', `Cakes (${cakeCollections.length})`],
              ['orders', `Orders (${orders.length})`],
              ['enquiries', `Cake Enquiries (${enquiries.length})`],
              ['contacts', `Messages (${contacts.length})`],
              ['gallery', `Gallery (${gallery.length})`],
              ['settings', 'Business Settings'],
            ] as Array<[AdminTab, string]>
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab
                  ? 'bg-[#28231F] text-white'
                  : 'bg-[#FFF9F1] text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {statusBanner && (
          <div className="p-3.5 rounded-xl bg-white border border-[#F36B21]/40 text-xs font-medium text-[#28231F] flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#F36B21]" />
            <span>{statusBanner}</span>
          </div>
        )}
        {dashError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dashError}</span>
            </span>
            <button
              type="button"
              onClick={() => setDashError(null)}
              className="text-red-700 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {loadingDash ? (
          <div className="py-16 text-center text-sm text-[#81766D]">Loading store data...</div>
        ) : (
          <>
            {/* TAB 0: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Active Menu Items
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {menuItems.length}
                    </p>
                    <p className="text-xs text-[#C94E16]">
                      {unavailableCount} marked out of stock · {menuCategories.length} categories
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Order Requests
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {orders.length}
                    </p>
                    <p className="text-xs text-[#C94E16]">
                      {newOrdersCount} new awaiting confirmation
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('enquiries')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Custom Cake Enquiries
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {enquiries.length}
                    </p>
                    <p className="text-xs text-[#C94E16]">{newEnquiriesCount} new requests</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('cakes')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Cake Collections
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {cakeCollections.length}
                    </p>
                    <p className="text-xs text-[#C94E16]">
                      {pendingVerificationCount} flagged for printed-price verification
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('contacts')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Customer Messages
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {contacts.length}
                    </p>
                    <p className="text-xs text-[#C94E16]">{newContactsCount} unread messages</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className="text-left rounded-2xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] p-5 space-y-1.5 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Gallery Photographs
                    </p>
                    <p className="font-editorial text-4xl font-semibold text-[#28231F] tabular-nums">
                      {gallery.length}
                    </p>
                    <p className="text-xs text-[#81766D]">Manage outlet &amp; dessert gallery</p>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: MENU ITEMS */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddMenuItem}
                  className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-4"
                >
                  <h2 className="text-sm font-semibold text-[#28231F]">Add New Menu Item</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div className="lg:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-[#28231F]">Item Name *</label>
                      <input
                        type="text"
                        required
                        value={newMenuName}
                        onChange={(e) => setNewMenuName(e.target.value)}
                        placeholder="e.g. Pistachio Brownie"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#28231F]">Section</label>
                      <select
                        value={newMenuSection}
                        onChange={(e) => setNewMenuSection(e.target.value as MenuSection)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-sm bg-white"
                      >
                        <option value="Savouries & Sips">Savouries &amp; Sips</option>
                        <option value="Sweet Side">Sweet Side</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#28231F]">Category *</label>
                      <input
                        type="text"
                        required
                        value={newMenuCategory}
                        onChange={(e) => setNewMenuCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#28231F]">Price (₹) *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newMenuPrice}
                        onChange={(e) => setNewMenuPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      value={newMenuDescription}
                      onChange={(e) => setNewMenuDescription(e.target.value)}
                      placeholder="Optional short description..."
                      className="px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMenuImage}
                        onChange={(e) => setNewMenuImage(e.target.value)}
                        placeholder="Image URL (optional)"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                      />
                      <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-xl border border-dashed border-[#F36B21] bg-[#FFF9F1] text-xs font-semibold text-[#C94E16] shrink-0">
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const url = await uploadImageFile(f);
                              setNewMenuImage(url);
                            } catch (err) {
                              setDashError(
                                err instanceof Error ? err.message : 'Upload failed'
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Menu Item</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Category Rename Helper */}
                <form
                  onSubmit={handleRenameCategory}
                  className="rounded-2xl bg-white border border-[#EEE7DF] p-5 flex flex-wrap items-end gap-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#28231F]">Section</label>
                    <select
                      value={renameSection}
                      onChange={(e) => setRenameSection(e.target.value as MenuSection)}
                      className="px-3 py-2 rounded-xl border border-[#EEE7DF] text-xs bg-white"
                    >
                      <option value="Savouries & Sips">Savouries &amp; Sips</option>
                      <option value="Sweet Side">Sweet Side</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex-1 min-w-[160px]">
                    <label className="text-xs font-semibold text-[#28231F]">
                      Existing Category Name
                    </label>
                    <input
                      type="text"
                      value={renameFrom}
                      onChange={(e) => setRenameFrom(e.target.value)}
                      placeholder="e.g. Snack Bread"
                      className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-xs"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-[160px]">
                    <label className="text-xs font-semibold text-[#28231F]">
                      New Category Name
                    </label>
                    <input
                      type="text"
                      value={renameTo}
                      onChange={(e) => setRenameTo(e.target.value)}
                      placeholder="e.g. Artisan Snack Breads"
                      className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold transition-colors"
                  >
                    Rename Category
                  </button>
                </form>

                <div className="rounded-2xl bg-white border border-[#EEE7DF] overflow-hidden">
                  <div className="p-4 border-b border-[#EEE7DF] flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-[#28231F]">
                      Menu Catalogue ({filteredMenu.length})
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        value={menuCategoryFilter}
                        onChange={(e) => setMenuCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-full border border-[#EEE7DF] text-xs bg-white"
                      >
                        <option value="All">All Categories</option>
                        {menuCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="search"
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Filter menu items..."
                        className="flex-1 sm:w-56 px-3.5 py-1.5 rounded-full border border-[#EEE7DF] text-xs"
                      />
                    </div>
                  </div>
                  <div className="divide-y divide-[#EEE7DF] max-h-[60vh] overflow-y-auto">
                    {filteredMenu.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#28231F]">{item.name}</p>
                          <p className="text-xs text-[#81766D]">
                            {item.category} · {item.section}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold text-[#28231F] tabular-nums">
                            {item.variants
                              ? item.variants.map((v) => `${v.label}: ₹${v.price}`).join(' / ')
                              : `₹${item.price}`}
                          </span>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#EEE7DF] hover:border-[#F36B21] text-xs font-medium text-[#28231F]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              item.available
                                ? 'bg-[#FFF9F1] text-[#1F7A3E] border border-[#1F7A3E]/30'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {item.available ? 'Available' : 'Out of Stock'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMenuItem(item)}
                            aria-label={`Delete ${item.name}`}
                            className="p-1.5 text-[#81766D] hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CAKE COLLECTIONS */}
            {activeTab === 'cakes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cakeCollections.map((col) => (
                  <div
                    key={col.id}
                    className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-editorial text-2xl font-semibold text-[#28231F]">
                          {col.name}
                        </h3>
                        <p className="text-xs text-[#81766D]">
                          {col.flavours.length} flavours
                        </p>
                      </div>
                      <select
                        value={col.priceVerificationStatus}
                        onChange={(e) => {
                          const nextVal = e.target.value as CakeCollection['priceVerificationStatus'];
                          setCakeCollections((prev) =>
                            prev.map((c) =>
                              c.id === col.id ? { ...c, priceVerificationStatus: nextVal } : c
                            )
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#EEE7DF] text-xs font-medium bg-[#FFF9F1]"
                      >
                        <option value="verified">Verified</option>
                        <option value="needs_verification">Needs Verification</option>
                        <option value="custom_quote">Custom Quote</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {col.halfKgPrice !== null && (
                        <label className="space-y-1">
                          <span className="text-[#81766D] block">Half KG (₹)</span>
                          <input
                            type="number"
                            value={col.halfKgPrice ?? ''}
                            onChange={(e) =>
                              setCakeCollections((prev) =>
                                prev.map((c) =>
                                  c.id === col.id
                                    ? { ...c, halfKgPrice: Number(e.target.value) || 0 }
                                    : c
                                )
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#EEE7DF] font-semibold tabular-nums"
                          />
                        </label>
                      )}
                      {col.oneKgPrice !== null && (
                        <label className="space-y-1">
                          <span className="text-[#81766D] block">1 KG (₹)</span>
                          <input
                            type="number"
                            value={col.oneKgPrice ?? ''}
                            onChange={(e) =>
                              setCakeCollections((prev) =>
                                prev.map((c) =>
                                  c.id === col.id
                                    ? { ...c, oneKgPrice: Number(e.target.value) || 0 }
                                    : c
                                )
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#EEE7DF] font-semibold tabular-nums"
                          />
                        </label>
                      )}
                      {col.pastryPrice != null && (
                        <label className="space-y-1">
                          <span className="text-[#81766D] block">Pastry (₹)</span>
                          <input
                            type="number"
                            value={col.pastryPrice ?? ''}
                            onChange={(e) =>
                              setCakeCollections((prev) =>
                                prev.map((c) =>
                                  c.id === col.id
                                    ? { ...c, pastryPrice: Number(e.target.value) || 0 }
                                    : c
                                )
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#EEE7DF] font-semibold tabular-nums"
                          />
                        </label>
                      )}
                      {col.perKgPrice != null && (
                        <label className="space-y-1">
                          <span className="text-[#81766D] block">Per KG (₹)</span>
                          <input
                            type="number"
                            value={col.perKgPrice ?? ''}
                            onChange={(e) =>
                              setCakeCollections((prev) =>
                                prev.map((c) =>
                                  c.id === col.id
                                    ? { ...c, perKgPrice: Number(e.target.value) || 0 }
                                    : c
                                )
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#EEE7DF] font-semibold tabular-nums"
                          />
                        </label>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-[#81766D] block">Description</label>
                      <textarea
                        rows={2}
                        value={col.description}
                        onChange={(e) =>
                          setCakeCollections((prev) =>
                            prev.map((c) =>
                              c.id === col.id ? { ...c, description: e.target.value } : c
                            )
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#EEE7DF] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-[#81766D] block">Verification Note</label>
                      <input
                        type="text"
                        value={col.verificationNote || ''}
                        onChange={(e) =>
                          setCakeCollections((prev) =>
                            prev.map((c) =>
                              c.id === col.id ? { ...c, verificationNote: e.target.value } : c
                            )
                          )
                        }
                        placeholder="Optional owner verification note..."
                        className="w-full px-3 py-1.5 rounded-lg border border-[#EEE7DF] text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveCakeCollection(col)}
                      className="px-4 py-2 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold transition-colors"
                    >
                      Save Collection
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: ORDER REQUESTS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white border border-[#EEE7DF] text-center text-sm text-[#81766D]">
                    No order requests have been submitted yet.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#81766D]">
                            <span className="font-semibold text-[#C94E16]">{order.id}</span>
                            <span>·</span>
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                            <span>·</span>
                            <span className="font-medium text-[#28231F]">{order.fulfillment}</span>
                          </div>
                          <h3 className="text-base font-semibold text-[#28231F]">
                            {order.customerName} ·{' '}
                            <span className="tabular-nums">{order.mobileNumber}</span>
                          </h3>
                          {order.notes && (
                            <p className="text-xs text-[#81766D]">Notes: {order.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-semibold text-[#28231F] tabular-nums">
                            ₹{order.estimatedSubtotal}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleOrderStatus(
                                order.id,
                                e.target.value as OrderRequest['status']
                              )
                            }
                            className="px-3 py-1.5 rounded-xl border border-[#EEE7DF] bg-[#FFF9F1] text-xs font-semibold"
                          >
                            <option value="New">New</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EEE7DF] flex flex-wrap gap-2">
                        {order.items.map((it, idx) => (
                          <span
                            key={`${it.itemId}-${idx}`}
                            className="px-3 py-1 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] text-xs text-[#28231F]"
                          >
                            {it.name}
                            {it.variantLabel ? ` (${it.variantLabel})` : ''} × {it.quantity} · ₹
                            {it.unitPrice * it.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: CAKE ENQUIRIES */}
            {activeTab === 'enquiries' && (
              <div className="space-y-4">
                {enquiries.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white border border-[#EEE7DF] text-center text-sm text-[#81766D]">
                    No custom cake enquiries have been submitted yet.
                  </div>
                ) : (
                  enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="rounded-2xl bg-white border border-[#EEE7DF] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#81766D]">
                          <span className="font-semibold text-[#C94E16]">{enq.id}</span>
                          <span>·</span>
                          <span>{new Date(enq.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#28231F]">
                          {enq.customerName} ·{' '}
                          <span className="tabular-nums">{enq.mobileNumber}</span>
                        </h3>
                        <p className="text-sm text-[#28231F]">
                          {enq.cakeCategory} — {enq.preferredFlavour} ({enq.cakeWeight}) ·{' '}
                          {enq.shapeOrDesign}
                        </p>
                        <p className="text-xs text-[#81766D]">
                          Required Date:{' '}
                          <strong className="text-[#28231F]">{enq.requiredDate}</strong>
                          {enq.instructions ? ` · Notes: ${enq.instructions}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {enq.referenceImageUrl && (
                          <a
                            href={enq.referenceImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-14 h-14 rounded-xl overflow-hidden border border-[#EEE7DF]"
                          >
                            <img
                              src={enq.referenceImageUrl}
                              alt="Reference"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        )}
                        <select
                          value={enq.status}
                          onChange={(e) =>
                            handleEnquiryStatus(enq.id, e.target.value as CakeEnquiry['status'])
                          }
                          className="px-3 py-2 rounded-xl border border-[#EEE7DF] bg-[#FFF9F1] text-xs font-semibold"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: CONTACT MESSAGES */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white border border-[#EEE7DF] text-center text-sm text-[#81766D]">
                    No contact messages have been received yet.
                  </div>
                ) : (
                  contacts.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl bg-white border border-[#EEE7DF] p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#81766D]">
                          <span className="font-semibold text-[#C94E16]">{msg.id}</span>
                          <span>·</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                          <span>·</span>
                          <span className="font-semibold text-[#28231F]">{msg.subject}</span>
                        </div>
                        <h3 className="text-base font-semibold text-[#28231F]">
                          {msg.name} · <span className="tabular-nums">{msg.phone}</span>
                          {msg.email ? (
                            <span className="text-xs font-normal text-[#81766D]">
                              {' '}
                              · {msg.email}
                            </span>
                          ) : null}
                        </h3>
                        <p className="text-sm text-[#81766D] leading-relaxed">{msg.message}</p>
                      </div>

                      <select
                        value={msg.status}
                        onChange={(e) =>
                          handleContactStatus(
                            msg.id,
                            e.target.value as ContactMessage['status']
                          )
                        }
                        className="px-3 py-2 rounded-xl border border-[#EEE7DF] bg-[#FFF9F1] text-xs font-semibold shrink-0"
                      >
                        <option value="New">New</option>
                        <option value="Replied">Replied</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 6: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddGallery}
                  className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-4"
                >
                  <h2 className="text-sm font-semibold text-[#28231F]">
                    Add Gallery Photograph
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      value={newGalTitle}
                      onChange={(e) => setNewGalTitle(e.target.value)}
                      placeholder="Photo title"
                      className="px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                    <select
                      value={newGalCat}
                      onChange={(e) =>
                        setNewGalCat(e.target.value as GalleryItem['category'])
                      }
                      className="px-3 py-2 rounded-xl border border-[#EEE7DF] text-sm bg-white"
                    >
                      <option value="Signature Cakes">Signature Cakes</option>
                      <option value="Cheesecakes">Cheesecakes</option>
                      <option value="Brownies">Brownies</option>
                      <option value="Waffles">Waffles</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Savouries">Savouries</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Café Experience">Café Experience</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={newGalImage}
                      onChange={(e) => setNewGalImage(e.target.value)}
                      placeholder="Image URL or upload"
                      className="px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl border border-dashed border-[#F36B21] bg-[#FFF9F1] text-xs font-semibold text-[#C94E16]">
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const url = await uploadImageFile(f);
                            setNewGalImage(url);
                          } catch (err) {
                            setDashError(
                              err instanceof Error ? err.message : 'Image upload failed'
                            );
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      required
                      value={newGalCaption}
                      onChange={(e) => setNewGalCaption(e.target.value)}
                      placeholder="Short caption..."
                      className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-[#28231F]">
                      <input
                        type="checkbox"
                        checked={newGalAuthentic}
                        onChange={(e) => setNewGalAuthentic(e.target.checked)}
                      />
                      <span>Authentic café photograph</span>
                    </label>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold"
                    >
                      Add to Gallery
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white border border-[#EEE7DF] overflow-hidden flex flex-col justify-between"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-[#F36B21] font-semibold">
                            {item.category}
                          </p>
                          <p className="text-sm font-semibold text-[#28231F] truncate">
                            {item.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="p-2 text-[#81766D] hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: BUSINESS SETTINGS */}
            {activeTab === 'settings' && settings && (
              <form
                onSubmit={handleSaveSettings}
                className="rounded-2xl bg-white border border-[#EEE7DF] p-6 sm:p-8 space-y-5 max-w-3xl"
              >
                <h2 className="font-editorial text-2xl font-semibold text-[#28231F]">
                  Business Details &amp; Homepage Content
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Brand Name</span>
                    <input
                      type="text"
                      value={settings.brandName}
                      onChange={(e) =>
                        setSettings({ ...settings, brandName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Tagline</span>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) =>
                        setSettings({ ...settings, tagline: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Positioning Badge</span>
                    <input
                      type="text"
                      value={settings.positioning}
                      onChange={(e) =>
                        setSettings({ ...settings, positioning: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Opening Hours</span>
                    <input
                      type="text"
                      value={settings.hours}
                      onChange={(e) =>
                        setSettings({ ...settings, hours: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Phone Number</span>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings({ ...settings, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">
                      WhatsApp Number (with 91)
                    </span>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Instagram Handle</span>
                    <input
                      type="text"
                      value={settings.instagramHandle}
                      onChange={(e) =>
                        setSettings({ ...settings, instagramHandle: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Instagram URL</span>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, instagramUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Street Address</span>
                    <input
                      type="text"
                      value={settings.addressLine1}
                      onChange={(e) =>
                        setSettings({ ...settings, addressLine1: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">City</span>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) =>
                        setSettings({ ...settings, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">State</span>
                    <input
                      type="text"
                      value={settings.state}
                      onChange={(e) =>
                        setSettings({ ...settings, state: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Postal Code</span>
                    <input
                      type="text"
                      value={settings.postalCode}
                      onChange={(e) =>
                        setSettings({ ...settings, postalCode: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Top Announcement Banner</span>
                  <input
                    type="text"
                    value={settings.promoBanner}
                    onChange={(e) =>
                      setSettings({ ...settings, promoBanner: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Hero Headline</span>
                  <input
                    type="text"
                    value={settings.heroHeadline}
                    onChange={(e) =>
                      setSettings({ ...settings, heroHeadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Hero Supporting Copy</span>
                  <textarea
                    rows={3}
                    value={settings.heroSubheadline}
                    onChange={(e) =>
                      setSettings({ ...settings, heroSubheadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                  />
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  Save Business Settings
                </button>
              </form>
            )}
          </>
        )}
      </main>

      {/* Edit Menu Item Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#28231F]/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${editingItem.name}`}
          onClick={() => setEditingItem(null)}
        >
          <form
            onSubmit={handleSaveEditedMenuItem}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl border border-[#EEE7DF] p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EEE7DF] pb-3">
              <h2 className="font-editorial text-2xl font-semibold text-[#28231F]">
                Edit Menu Item
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                aria-label="Close edit modal"
                className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#81766D] hover:bg-[#FFF9F1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-[#28231F]">Item Name</span>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-[#28231F]">Section</span>
                <select
                  value={editingItem.section}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      section: e.target.value as MenuSection,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-sm bg-white"
                >
                  <option value="Savouries & Sips">Savouries &amp; Sips</option>
                  <option value="Sweet Side">Sweet Side</option>
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-[#28231F]">Category</span>
                <input
                  type="text"
                  required
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-[#28231F]">Unit Note (Optional)</span>
                <input
                  type="text"
                  value={editingItem.unitNote || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, unitNote: e.target.value })
                  }
                  placeholder="e.g. per scoop"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#28231F]">
                <input
                  type="checkbox"
                  checked={editHasVariants}
                  onChange={(e) => setEditHasVariants(e.target.checked)}
                />
                <span>Use size variants (e.g. 6-inch / 8-inch)</span>
              </label>

              {!editHasVariants ? (
                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Price (₹)</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingItem.price ?? ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                  />
                </label>
              ) : (
                <div className="space-y-2">
                  {editVariants.map((variant, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={variant.label}
                        onChange={(e) =>
                          setEditVariants((prev) =>
                            prev.map((v, i) =>
                              i === idx ? { ...v, label: e.target.value } : v
                            )
                          )
                        }
                        placeholder="Size label"
                        className="px-3 py-1.5 rounded-xl border border-[#EEE7DF] text-xs"
                      />
                      <input
                        type="number"
                        min={1}
                        value={variant.price}
                        onChange={(e) =>
                          setEditVariants((prev) =>
                            prev.map((v, i) =>
                              i === idx
                                ? { ...v, price: Number(e.target.value) || 0 }
                                : v
                            )
                          )
                        }
                        placeholder="Price (₹)"
                        className="px-3 py-1.5 rounded-xl border border-[#EEE7DF] text-xs tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#28231F]">Image URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingItem.image || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image: e.target.value })
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                />
                <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-xl border border-dashed border-[#F36B21] bg-[#FFF9F1] text-xs font-semibold text-[#C94E16] shrink-0">
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await uploadImageFile(f);
                        setEditingItem((prev) => (prev ? { ...prev, image: url } : null));
                      } catch (err) {
                        setDashError(
                          err instanceof Error ? err.message : 'Upload failed'
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <label className="space-y-1 text-xs block">
              <span className="font-semibold text-[#28231F]">Description (Optional)</span>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#28231F]">
              <input
                type="checkbox"
                checked={editingItem.available}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, available: e.target.checked })
                }
              />
              <span>Available on menu</span>
            </label>

            <div className="pt-3 border-t border-[#EEE7DF] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-5 py-2 rounded-full border border-[#EEE7DF] text-xs font-semibold text-[#81766D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
