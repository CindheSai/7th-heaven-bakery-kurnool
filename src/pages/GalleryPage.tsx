import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SafeImage } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import type { GalleryItem } from '../types/bakery.ts';

const CATEGORY_ORDER: Array<GalleryItem['category']> = [
  'Café Experience',
  'Signature Cakes',
  'Desserts',
  'Brownies',
  'Cheesecakes',
  'Waffles',
  'Savouries',
  'Beverages',
];

export function GalleryPage() {
  const { gallery } = useBakery();
  const [activeCategory, setActiveCategory] = useState<'All' | GalleryItem['category']>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const availableCategories = useMemo<Array<'All' | GalleryItem['category']>>(() => {
    const present = new Set(gallery.map((g) => g.category));
    return ['All', ...CATEGORY_ORDER.filter((cat) => present.has(cat))];
  }, [gallery]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return gallery;
    return gallery.filter((g) => g.category === activeCategory);
  }, [gallery, activeCategory]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % filtered.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + filtered.length) % filtered.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, filtered.length]);

  const activeItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-5">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
              Visual Gallery · Gandhi Nagar, Kurnool
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
              Inside 7th Heaven Bakery &amp; Cafe
            </h1>
            <p className="text-sm sm:text-base text-[#81766D] leading-relaxed">
              Real photographs from our Gandhi Nagar, Kurnool outlet — showcasing our storefront, café seating, cake showcases, brownies, and handcrafted creations.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setLightboxIdx(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#28231F] text-white'
                    : 'bg-white text-[#81766D] border border-[#EEE7DF] hover:text-[#28231F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-[#EEE7DF] bg-[#FFF9F1]/40 space-y-2">
            <p className="font-editorial text-2xl text-[#28231F]">
              No photographs in this category yet
            </p>
            <p className="text-xs text-[#81766D]">
              Store owners can upload more outlet photos anytime via Store Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <figure
                key={item.id}
                className="group rounded-2xl border border-[#EEE7DF] bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(40,35,31,0.08)] flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="flex flex-col flex-1 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21]"
                  aria-label={`View ${item.title} full screen`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#FFF9F1]">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-5 space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#81766D]">
                      <span className="text-[#F36B21] font-semibold">{item.category}</span>
                      <span>
                        {item.isAuthenticBusinessPhoto ? 'Kurnool Outlet' : 'Representative'}
                      </span>
                    </div>
                    <h2 className="font-editorial text-xl font-semibold text-[#28231F]">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#81766D]">{item.caption}</p>
                  </figcaption>
                </button>
              </figure>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox */}
      {activeItem && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#28231F]/90 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            aria-label="Close gallery viewer"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length);
                }}
                aria-label="Previous image"
                className="absolute left-4 sm:left-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((lightboxIdx + 1) % filtered.length);
                }}
                aria-label="Next image"
                className="absolute right-4 sm:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] max-h-[72vh] w-full bg-[#FFF9F1]">
              <SafeImage
                src={activeItem.image}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
              <div>
                <p className="text-xs font-semibold text-[#F36B21]">{activeItem.category}</p>
                <p className="font-editorial text-2xl font-semibold text-[#28231F]">
                  {activeItem.title}
                </p>
              </div>
              <p className="text-xs text-[#81766D]">{activeItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
