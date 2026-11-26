import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBakery } from '../context/BakeryContext.tsx';

export function CartDrawer() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    settings,
  } = useBakery();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const buildQuickWhatsAppUrl = () => {
    const lines = [
      `Hello ${settings.brandName}, I would like to place an order enquiry:`,
      '',
      ...cart.map(
        (item, idx) =>
          `${idx + 1}. ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} × ${
            item.quantity
          } = ₹${item.unitPrice * item.quantity}`
      ),
      '',
      `Estimated Subtotal: ₹${cartSubtotal}`,
      'Please confirm availability and total.',
    ];
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Order Bag"
    >
      <div
        className="fixed inset-0 bg-[#28231F]/35 backdrop-blur-xs"
        onClick={() => setIsCartOpen(false)}
      />
      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-[#EEE7DF] flex flex-col">
        <div className="px-6 py-5 border-b border-[#EEE7DF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F36B21]" />
            <h2 className="font-editorial text-2xl font-semibold text-[#28231F]">
              Order Bag
            </h2>
            <span className="text-xs text-[#81766D] tabular-nums">
              · {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close order bag"
            className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[#81766D] hover:bg-[#FFF9F1] hover:text-[#28231F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF9F1] border border-[#EEE7DF] flex items-center justify-center text-[#F36B21]">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-editorial text-2xl text-[#28231F]">Your bag is empty</p>
                <p className="text-sm text-[#81766D]">
                  Explore our savouries, cheesecakes, brownies, and beverages to start an order request.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/menu');
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-sm font-semibold transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartKey}
                className="pb-4 border-b border-[#EEE7DF] flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#81766D]">{item.category}</p>
                  <p className="text-sm font-semibold text-[#28231F] mt-0.5">
                    {item.name}
                    {item.variantLabel ? (
                      <span className="text-[#81766D] font-normal"> · {item.variantLabel}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[#81766D] tabular-nums mt-1">
                    ₹{item.unitPrice} each
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-sm font-semibold text-[#28231F] tabular-nums">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="inline-flex items-center border border-[#EEE7DF] rounded-full bg-[#FFF9F1]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="w-7 h-7 inline-flex items-center justify-center text-[#28231F] hover:text-[#F36B21]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartKey, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="w-7 h-7 inline-flex items-center justify-center text-[#28231F] hover:text-[#F36B21]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartKey)}
                      aria-label={`Remove ${item.name}`}
                      className="w-7 h-7 inline-flex items-center justify-center rounded-full text-[#81766D] hover:text-[#C94E16] hover:bg-[#FFF9F1]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[#EEE7DF] bg-[#FFF9F1] space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#81766D]">Estimated Subtotal</span>
              <span className="text-xl font-semibold text-[#28231F] tabular-nums">
                ₹{cartSubtotal}
              </span>
            </div>
            <p className="text-xs text-[#81766D] leading-relaxed">
              Order Request Only — no online payment is taken here. Availability and final billing are confirmed by our Kurnool team.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/cart');
                }}
                className="py-2.5 px-4 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Review Order Page
              </button>
              <a
                href={buildQuickWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold text-center transition-colors whitespace-nowrap"
              >
                Send via WhatsApp
              </a>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
