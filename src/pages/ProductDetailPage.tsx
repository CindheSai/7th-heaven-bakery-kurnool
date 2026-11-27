import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage, VegMark } from '../components/BrandMark.tsx';
import { MenuItemCard } from '../components/MenuItemCard.tsx';
import { useBakery } from '../context/BakeryContext.tsx';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    menuItems,
    cart,
    addToCart,
    updateQuantity,
    setIsCartOpen,
    settings,
  } = useBakery();

  const decodedId = id ? decodeURIComponent(id) : '';
  const item = useMemo(
    () => menuItems.find((m) => m.id === decodedId),
    [menuItems, decodedId]
  );

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  useEffect(() => {
    setSelectedVariantIdx(0);
    if (item) {
      document.title = `${item.name} – ${item.category} | ${settings.brandName}`;
    }
  }, [item, settings.brandName]);

  const relatedItems = useMemo(() => {
    if (!item) return [];
    const sameCategory = menuItems.filter(
      (m) => m.id !== item.id && m.category === item.category
    );
    if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
    const sameSection = menuItems.filter(
      (m) =>
        m.id !== item.id &&
        m.category !== item.category &&
        m.section === item.section
    );
    return [...sameCategory, ...sameSection].slice(0, 3);
  }, [item, menuItems]);

  if (!item) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-3xl border border-[#EEE7DF] bg-[#FFF9F1]/60 p-8 text-center space-y-4">
          <h1 className="font-editorial text-3xl font-semibold text-[#28231F]">
            Item Not Found
          </h1>
          <p className="text-sm text-[#81766D]">
            This menu item may have been updated or removed. Browse our full café menu to see current offerings.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const activeVariant = hasVariants ? item.variants![selectedVariantIdx] : undefined;
  const currentPrice = activeVariant ? activeVariant.price : item.price ?? 0;
  const cartKey = activeVariant ? `${item.id}::${activeVariant.label}` : item.id;
  const cartEntry = cart.find((c) => c.cartKey === cartKey);

  const whatsappInquiryUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `Hello ${settings.brandName}, I would like to enquire about ${item.name}${
      activeVariant ? ` (${activeVariant.label})` : ''
    } listed at ₹${currentPrice}.`
  )}`;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-2 text-xs text-[#81766D]">
          <Link to="/" className="hover:text-[#F36B21]">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/menu?section=${encodeURIComponent(item.section)}`}
            className="hover:text-[#F36B21]"
          >
            {item.section}
          </Link>
          <span>/</span>
          <Link
            to={`/menu?category=${encodeURIComponent(item.category)}`}
            className="hover:text-[#F36B21]"
          >
            {item.category}
          </Link>
          <span>/</span>
          <span className="text-[#28231F] font-medium truncate">{item.name}</span>
        </div>
      </div>

      {/* Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#EEE7DF] bg-[#FFF9F1] aspect-[4/3]">
            <SafeImage
              src={item.image}
              alt={item.name}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {item.isVeg && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] text-xs font-semibold text-[#28231F]">
                  <VegMark className="w-3.5 h-3.5" />
                  <span>100% Pure Vegetarian</span>
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  item.available
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {item.available ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Available Today</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Currently Out of Stock</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                {item.section} · {item.category}
              </p>
              <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
                {item.name}
              </h1>
              {item.unitNote && (
                <p className="text-sm text-[#81766D]">{item.unitNote}</p>
              )}
            </div>

            <p className="text-sm sm:text-base text-[#81766D] leading-relaxed">
              {item.description ||
                `Freshly prepared 100% pure vegetarian ${item.name} from our ${item.category} selection at ${settings.brandName}, Gandhi Nagar, Kurnool.`}
            </p>

            {hasVariants && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#28231F]">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {item.variants!.map((variant, idx) => {
                    const active = idx === selectedVariantIdx;
                    return (
                      <button
                        key={variant.label}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                          active
                            ? 'bg-[#28231F] text-white border-[#28231F]'
                            : 'bg-[#FFF9F1] text-[#28231F] border-[#EEE7DF] hover:border-[#F36B21]'
                        }`}
                      >
                        {variant.label} · ₹{variant.price}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#EEE7DF] flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-xs text-[#81766D]">Menu Price (excl. taxes)</p>
                <p className="text-3xl font-semibold text-[#28231F] tabular-nums mt-0.5">
                  ₹{currentPrice}
                  {item.unitNote === 'per scoop' ? (
                    <span className="text-sm font-normal text-[#81766D]"> / scoop</span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {item.available ? (
                cartEntry ? (
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-[#F36B21] bg-[#FFF9F1] text-[#C94E16]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartKey, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-11 h-11 inline-flex items-center justify-center hover:text-[#28231F]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {cartEntry.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartKey, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-11 h-11 inline-flex items-center justify-center hover:text-[#28231F]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#28231F] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Open Order Bag</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(item, activeVariant?.label, currentPrice)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Order Bag</span>
                  </button>
                )
              ) : (
                <span className="px-5 py-3 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] text-xs font-semibold text-[#81766D]">
                  Currently Unavailable
                </span>
              )}

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>

            <p className="text-xs text-[#81766D]">
              Order requests are prepared fresh at {settings.addressLine1}, {settings.city}. Open daily {settings.hours}.
            </p>
          </div>
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <section className="pt-10 border-t border-[#EEE7DF] space-y-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                  More From {item.category}
                </p>
                <h2 className="font-editorial text-3xl font-semibold text-[#28231F] mt-1">
                  You Might Also Enjoy
                </h2>
              </div>
              <Link
                to={`/menu?category=${encodeURIComponent(item.category)}`}
                className="text-xs font-semibold text-[#C94E16] hover:text-[#F36B21] underline underline-offset-4"
              >
                View All in {item.category}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((rel) => (
                <MenuItemCard key={rel.id} item={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
