import { CakeSlice, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBakery } from '../context/BakeryContext.tsx';
import { VegMark } from './BrandMark.tsx';

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, menuItems, cakeCollections, addToCart } = useBakery();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const trimmed = query.trim().toLowerCase();

  const matchedCakes = useMemo(() => {
    if (!trimmed) return [];
    return cakeCollections
      .filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.flavours.some((f) => f.name.toLowerCase().includes(trimmed))
      )
      .slice(0, 4);
  }, [cakeCollections, trimmed]);

  const matchedItems = useMemo(() => {
    if (!trimmed) return menuItems.slice(0, 6);
    return menuItems
      .filter(
        (m) =>
          m.name.toLowerCase().includes(trimmed) ||
          m.category.toLowerCase().includes(trimmed) ||
          m.section.toLowerCase().includes(trimmed) ||
          (m.unitNote && m.unitNote.toLowerCase().includes(trimmed))
      )
      .slice(0, 12);
  }, [menuItems, trimmed]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search Menu and Cakes"
    >
      <div
        className="fixed inset-0 bg-[#28231F]/40 backdrop-blur-xs"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-[#EEE7DF] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEE7DF]">
          <Search className="w-5 h-5 text-[#F36B21] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cheesecakes, brownies, waffles, pizza, coffee, cakes..."
            className="w-full text-sm sm:text-base text-[#28231F] placeholder:text-[#81766D] bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full text-[#81766D] hover:bg-[#FFF9F1] hover:text-[#28231F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[#EEE7DF]">
          {matchedCakes.length > 0 && (
            <div className="p-4 bg-[#FFF9F1]/60 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D] px-1">
                Cake Collections
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedCakes.map((cake) => (
                  <button
                    key={cake.id}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/cakes?collection=${cake.slug}`);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#EEE7DF] hover:border-[#F36B21] text-left transition-colors"
                  >
                    <CakeSlice className="w-4 h-4 text-[#F36B21] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#28231F] truncate">{cake.name}</p>
                      <p className="text-xs text-[#81766D] truncate">
                        {cake.flavours.length} {cake.flavours.length === 1 ? 'option' : 'flavours'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D] px-1">
              {trimmed ? `Café Menu Matches (${matchedItems.length})` : 'Popular Café Selections'}
            </p>
            {matchedItems.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-medium text-[#28231F]">No items found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-[#81766D]">
                  Try searching for Biscoff, Paneer, Waffle, Frappe, or Rasmalai.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchedItems.map((item) => {
                  const firstVariant = item.variants?.[0];
                  const displayPrice = firstVariant ? firstVariant.price : item.price;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF9F1] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/menu?category=${encodeURIComponent(item.category)}`);
                        }}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                      >
                        <VegMark className="w-3.5 h-3.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#28231F] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#81766D] truncate">
                            {item.category} · {item.section}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-[#28231F] tabular-nums">
                          {item.variants
                            ? `₹${item.variants[0].price} / ₹${item.variants[1]?.price}`
                            : `₹${displayPrice}`}
                        </span>
                        {item.available ? (
                          <button
                            type="button"
                            onClick={() =>
                              addToCart(item, firstVariant?.label, displayPrice)
                            }
                            className="px-3 py-1.5 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] hover:border-[#F36B21] hover:bg-[#F36B21] hover:text-white text-xs font-semibold text-[#C94E16] transition-colors"
                          >
                            + Add
                          </button>
                        ) : (
                          <span className="text-xs text-[#81766D]">Unavailable</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
