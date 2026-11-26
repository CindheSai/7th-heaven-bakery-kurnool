import { Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { VegMark } from '../components/BrandMark.tsx';
import { MenuItemCard } from '../components/MenuItemCard.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import type { MenuSection } from '../types/bakery.ts';

export function MenuPage() {
  const { menuItems, cartCount, cartSubtotal, setIsCartOpen } = useBakery();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSection = (searchParams.get('section') as MenuSection | 'All') || 'All';
  const initialCategory = searchParams.get('category') || 'All';

  const [sectionFilter, setSectionFilter] = useState<'All' | MenuSection>(
    initialSection === 'Savouries & Sips' || initialSection === 'Sweet Side'
      ? initialSection
      : 'All'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const paramCat = searchParams.get('category');
    const paramSec = searchParams.get('section');
    if (paramCat) {
      setCategoryFilter(paramCat);
      const match = menuItems.find((m) => m.category === paramCat);
      if (match) setSectionFilter(match.section);
    }
    if (paramSec === 'Savouries & Sips' || paramSec === 'Sweet Side') {
      setSectionFilter(paramSec);
      if (!paramCat) setCategoryFilter('All');
    }
  }, [searchParams, menuItems]);

  const categories = useMemo(() => {
    const relevant =
      sectionFilter === 'All'
        ? menuItems
        : menuItems.filter((item) => item.section === sectionFilter);
    return Array.from(new Set(relevant.map((item) => item.category)));
  }, [menuItems, sectionFilter]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (sectionFilter !== 'All' && item.section !== sectionFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (q) {
        const hay = `${item.name} ${item.category} ${item.section} ${item.unitNote || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [menuItems, sectionFilter, categoryFilter, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, typeof filteredItems>();
    for (const item of filteredItems) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  const handleSectionChange = (next: 'All' | MenuSection) => {
    setSectionFilter(next);
    setCategoryFilter('All');
    if (next === 'All') {
      searchParams.delete('section');
      searchParams.delete('category');
    } else {
      searchParams.set('section', next);
      searchParams.delete('category');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-[#81766D]">
            <span className="inline-flex items-center gap-1.5 text-[#28231F] font-semibold">
              <VegMark className="w-3.5 h-3.5" />
              <span>100% PURE VEG</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>All prices in INR (₹)</span>
            <span aria-hidden="true">·</span>
            <span>{menuItems.length} café &amp; patisserie items</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
                Savouries, Sips &amp; Sweet Side
              </h1>
              <p className="text-sm sm:text-base text-[#81766D]">
                Browse our complete café menu. Looking for celebration cakes by weight? Visit our{' '}
                <Link to="/cakes" className="text-[#C94E16] font-semibold underline underline-offset-4">
                  Cake Catalogue
                </Link>
                .
              </p>
            </div>

            {/* Live Search */}
            <div className="w-full lg:w-80 relative">
              <Search className="w-4 h-4 text-[#81766D] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search puffs, pizza, biscoff, frappe..."
                aria-label="Filter menu items"
                className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white border border-[#EEE7DF] text-sm text-[#28231F] placeholder:text-[#81766D] focus:outline-none focus:border-[#F36B21]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81766D] hover:text-[#28231F]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Toolbar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex items-center p-1 rounded-full bg-[#FFF9F1] border border-[#EEE7DF]"
              role="tablist"
              aria-label="Menu sections"
            >
              {(['All', 'Savouries & Sips', 'Sweet Side'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  role="tab"
                  aria-selected={sectionFilter === sec}
                  onClick={() => handleSectionChange(sec)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    sectionFilter === sec
                      ? 'bg-[#F36B21] text-white'
                      : 'text-[#81766D] hover:text-[#28231F]'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {cartCount > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#28231F] text-white text-xs font-semibold tabular-nums hover:bg-[#C94E16] transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} · ₹{cartSubtotal}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleCategoryChange('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                categoryFilter === 'All'
                  ? 'bg-[#28231F] text-white'
                  : 'bg-[#FFF9F1] text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#28231F] text-white'
                    : 'bg-[#FFF9F1] text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {groupedByCategory.length === 0 ? (
          <div className="py-20 text-center space-y-3 border border-[#EEE7DF] rounded-2xl bg-[#FFF9F1]/40">
            <p className="font-editorial text-2xl text-[#28231F]">No matching items found</p>
            <p className="text-sm text-[#81766D]">
              Try clearing your search or switching back to all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleSectionChange('All');
              }}
              className="px-5 py-2 rounded-full bg-[#F36B21] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedByCategory.map(([category, items]) => (
            <section key={category} aria-labelledby={`cat-${category}`} className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-[#EEE7DF] pb-3">
                <div>
                  <p className="text-xs text-[#F36B21] font-semibold uppercase tracking-wider">
                    {items[0]?.section}
                  </p>
                  <h2
                    id={`cat-${category}`}
                    className="font-editorial text-3xl font-semibold text-[#28231F] mt-0.5"
                  >
                    {category}
                  </h2>
                </div>
                <span className="text-xs text-[#81766D] tabular-nums">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
