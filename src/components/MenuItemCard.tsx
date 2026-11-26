import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useBakery } from '../context/BakeryContext.tsx';
import type { MenuItem } from '../types/bakery.ts';
import { VegMark } from './BrandMark.tsx';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { cart, addToCart, updateQuantity } = useBakery();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const hasVariants = Boolean(item.variants && item.variants.length > 0);
  const activeVariant = hasVariants ? item.variants![selectedVariantIdx] : undefined;
  const currentPrice = activeVariant ? activeVariant.price : item.price ?? 0;
  const cartKey = activeVariant ? `${item.id}::${activeVariant.label}` : item.id;
  const cartEntry = cart.find((c) => c.cartKey === cartKey);

  return (
    <article
      className={`group rounded-2xl border border-[#EEE7DF] bg-white p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(40,35,31,0.06)] ${
        !item.available ? 'opacity-65' : ''
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {item.isVeg && <VegMark className="w-3.5 h-3.5 shrink-0" />}
            <span className="text-xs text-[#81766D] truncate">{item.category}</span>
          </div>
          {!item.available && (
            <span className="text-xs font-medium text-[#C94E16] shrink-0">Unavailable</span>
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#28231F] leading-snug">
            {item.name}
          </h3>
          {item.unitNote && (
            <p className="text-xs text-[#81766D] mt-0.5">{item.unitNote}</p>
          )}
        </div>

        {hasVariants && (
          <div className="pt-1 flex items-center gap-1.5" role="group" aria-label={`Size options for ${item.name}`}>
            {item.variants!.map((variant, idx) => {
              const active = idx === selectedVariantIdx;
              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#28231F] text-white'
                      : 'bg-[#FFF9F1] text-[#28231F] border border-[#EEE7DF] hover:border-[#F36B21]'
                  }`}
                >
                  {variant.label} · ₹{variant.price}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#EEE7DF] flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-[#28231F] tabular-nums">
            ₹{currentPrice}
          </span>
          {item.unitNote === 'per scoop' && (
            <span className="text-xs text-[#81766D]">/ scoop</span>
          )}
        </div>

        {item.available ? (
          cartEntry ? (
            <div className="inline-flex items-center rounded-full border border-[#F36B21] bg-[#FFF9F1] text-[#C94E16]">
              <button
                type="button"
                onClick={() => updateQuantity(cartKey, -1)}
                aria-label={`Decrease quantity of ${item.name}`}
                className="w-8 h-8 inline-flex items-center justify-center hover:text-[#28231F]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-semibold tabular-nums">
                {cartEntry.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(cartKey, 1)}
                aria-label={`Increase quantity of ${item.name}`}
                className="w-8 h-8 inline-flex items-center justify-center hover:text-[#28231F]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(item, activeVariant?.label, currentPrice)}
              className="px-4 py-2 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] hover:border-[#F36B21] hover:bg-[#F36B21] hover:text-white text-xs font-semibold text-[#C94E16] transition-colors whitespace-nowrap shrink-0"
            >
              Add to Bag
            </button>
          )
        ) : (
          <span className="text-xs text-[#81766D]">Currently out</span>
        )}
      </div>
    </article>
  );
}
