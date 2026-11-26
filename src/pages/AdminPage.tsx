import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBakery } from '../context/BakeryContext.tsx';
import type {
  CakeCollection,
  CakeEnquiry,
  GalleryItem,
  MenuItem,
  MenuSection,
  SiteSettings,
} from '../types/bakery.ts';

type AdminTab = 'menu' | 'cakes' | 'enquiries' | 'gallery' | 'settings';

export function AdminPage() {
  const { refreshStore } = useBakery();

  const [authStatus, setAuthStatus] = useState<{
    loading: boolean;
    configured: boolean;
    mode: 'env_passcode' | 'claimed_password' | 'claim_required';
  }>({ loading: true, configured: false, mode: 'claim_required' });

  // Token strictly kept in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cakeCollections, setCakeCollections] = useState<CakeCollection[]>([]);
  const [enquiries, setEnquiries] = useState<CakeEnquiry[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Menu search & quick-add state
  const [menuSearch, setMenuSearch] = useState('');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuSection, setNewMenuSection] = useState<MenuSection>('Sweet Side');
  const [newMenuCategory, setNewMenuCategory] = useState('Brownies');
  const [newMenuPrice, setNewMenuPrice] = useState('100');

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
    }, 3000);
  };

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth-status');
      const data = await res.json();
      setAuthStatus({
        loading: false,
        configured: Boolean(data.configured),
        mode: data.mode || 'claim_required',
      });
    } catch {
      setAuthStatus({ loading: false, configured: false, mode: 'claim_required' });
    }
  }, []);

  useEffect(() => {
    void fetchAuthStatus();
  }, [fetchAuthStatus]);

  const loadDashboard = useCallback(async (authToken: string) => {
    setLoadingDash(true);
    setDashError(null);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        setToken(null);
        throw new Error('Admin session expired. Please sign in again.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard.');
      setMenuItems(data.menuItems || []);
      setCakeCollections(data.cakeCollections || []);
      setEnquiries(data.enquiries || []);
      setGallery(data.gallery || []);
      setSettings(data.settings || null);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void loadDashboard(token);
    }
  }, [token, loadDashboard]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim admin access.');
      setToken(data.token);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid passcode.');
      setToken(data.token);
      setPasswordInput('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const authedFetch = async (url: string, init: RequestInit) => {
    if (!token) throw new Error('Not authenticated.');
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    const data = await res.json();
    if (res.status === 401) {
      setToken(null);
      throw new Error('Session expired. Please sign in again.');
    }
    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
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

  const handleUpdateItemPrice = async (item: MenuItem, newPrice: number) => {
    if (!Number.isFinite(newPrice) || newPrice <= 0) return;
    try {
      const data = await authedFetch(`/api/admin/menu/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ price: Math.round(newPrice) }),
      });
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? data.item : m)));
      await refreshStore();
      notify(`Price updated for ${item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Price update failed.');
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(newMenuPrice);
    if (!newMenuName.trim() || !newMenuCategory.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
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
          isVeg: true,
          available: true,
        }),
      });
      setMenuItems((prev) => [data.item, ...prev]);
      setNewMenuName('');
      await refreshStore();
      notify(`Added ${data.item.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to add menu item.');
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

  // Cake Collection Update
  const handleSaveCakeCollection = async (col: CakeCollection) => {
    try {
      const data = await authedFetch(`/api/admin/cakes/${encodeURIComponent(col.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          halfKgPrice: col.halfKgPrice,
          oneKgPrice: col.oneKgPrice,
          pastryPrice: col.pastryPrice ?? null,
          perKgPrice: col.perKgPrice ?? null,
          priceVerificationStatus: col.priceVerificationStatus,
          verificationNote: col.verificationNote || '',
        }),
      });
      setCakeCollections((prev) => prev.map((c) => (c.id === col.id ? data.collection : c)));
      await refreshStore();
      notify(`Saved ${col.name}`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to save cake collection.');
    }
  };

  // Enquiry Status Update
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error('Read failed'));
        r.readAsDataURL(file);
      });
      const res = await fetch('/api/enquiries/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setNewGalImage(data.url);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Image upload failed');
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

  const filteredMenu = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.section.toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  // Auth Gate UI
  if (!token) {
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
            <p className="text-sm text-center text-[#81766D] py-4">Checking store security...</p>
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
              7th Heaven Bakery &amp; Cafe
            </p>
            <h1 className="font-editorial text-3xl font-semibold text-[#28231F]">
              Store Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => token && loadDashboard(token)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EEE7DF] bg-white hover:border-[#F36B21] text-xs font-semibold text-[#28231F]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setToken(null)}
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
              ['menu', `Menu Items (${menuItems.length})`],
              ['cakes', `Cake Collections (${cakeCollections.length})`],
              ['enquiries', `Cake Enquiries (${enquiries.length})`],
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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dashError}</span>
          </div>
        )}

        {loadingDash ? (
          <div className="py-16 text-center text-sm text-[#81766D]">Loading store data...</div>
        ) : (
          <>
            {/* TAB 1: MENU ITEMS */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddMenuItem}
                  className="rounded-2xl bg-white border border-[#EEE7DF] p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                >
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#28231F]">Item Name</label>
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
                    <label className="text-xs font-semibold text-[#28231F]">Category</label>
                    <input
                      type="text"
                      required
                      value={newMenuCategory}
                      onChange={(e) => setNewMenuCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-[#28231F]">Price (₹)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newMenuPrice}
                        onChange={(e) => setNewMenuPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                      />
                    </div>
                    <button
                      type="submit"
                      className="self-end px-4 py-2 rounded-xl bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                <div className="rounded-2xl bg-white border border-[#EEE7DF] overflow-hidden">
                  <div className="p-4 border-b border-[#EEE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-[#28231F]">
                      Menu Catalogue ({filteredMenu.length})
                    </h2>
                    <input
                      type="search"
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      placeholder="Filter menu items..."
                      className="w-full sm:w-64 px-3.5 py-1.5 rounded-full border border-[#EEE7DF] text-xs"
                    />
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

                        <div className="flex items-center gap-3">
                          {item.variants ? (
                            <span className="text-xs text-[#81766D] tabular-nums">
                              {item.variants.map((v) => `${v.label}: ₹${v.price}`).join(' / ')}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-[#81766D]">₹</span>
                              <input
                                type="number"
                                min={1}
                                defaultValue={item.price}
                                onBlur={(e) => {
                                  const next = Number(e.target.value);
                                  if (next && next !== item.price) {
                                    void handleUpdateItemPrice(item, next);
                                  }
                                }}
                                className="w-20 px-2.5 py-1 rounded-lg border border-[#EEE7DF] text-xs font-semibold tabular-nums"
                              />
                            </div>
                          )}

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

            {/* TAB 3: CAKE ENQUIRIES */}
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
                          {enq.customerName} · <span className="tabular-nums">{enq.mobileNumber}</span>
                        </h3>
                        <p className="text-sm text-[#28231F]">
                          {enq.cakeCategory} — {enq.preferredFlavour} ({enq.cakeWeight}) ·{' '}
                          {enq.shapeOrDesign}
                        </p>
                        <p className="text-xs text-[#81766D]">
                          Required Date: <strong className="text-[#28231F]">{enq.requiredDate}</strong>
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

            {/* TAB 4: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddGallery}
                  className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-4"
                >
                  <h2 className="text-sm font-semibold text-[#28231F]">Add Gallery Photograph</h2>
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
                      onChange={(e) => setNewGalCat(e.target.value as GalleryItem['category'])}
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
                        onChange={handleGalleryUpload}
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
                          <p className="text-xs text-[#F36B21] font-semibold">{item.category}</p>
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

            {/* TAB 5: BUSINESS SETTINGS */}
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
                      onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Opening Hours</span>
                    <input
                      type="text"
                      value={settings.hours}
                      onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">Phone Number</span>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm tabular-nums"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold text-[#28231F]">WhatsApp Number (with 91)</span>
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
                    <span className="font-semibold text-[#28231F]">Street Address</span>
                    <input
                      type="text"
                      value={settings.addressLine1}
                      onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Hero Headline</span>
                  <input
                    type="text"
                    value={settings.heroHeadline}
                    onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EEE7DF] text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs block">
                  <span className="font-semibold text-[#28231F]">Hero Supporting Copy</span>
                  <textarea
                    rows={3}
                    value={settings.heroSubheadline}
                    onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
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
    </div>
  );
}
