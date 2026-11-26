import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';

export function CartPage() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    settings,
  } = useBakery();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillment, setFulfillment] = useState<'Store Pickup' | 'Local Delivery Enquiry'>(
    'Store Pickup'
  );
  const [notes, setNotes] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendOrderRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const lines = [
      `Hello ${settings.brandName}, here is my Order Request:`,
      '',
      ...cart.map(
        (item, i) =>
          `${i + 1}. ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} × ${
            item.quantity
          } = ₹${item.unitPrice * item.quantity}`
      ),
      '',
      `Estimated Subtotal: ₹${cartSubtotal}`,
      `Order Type: ${fulfillment}`,
      customerName.trim() ? `Customer Name: ${customerName.trim()}` : '',
      customerPhone.trim() ? `Phone: ${customerPhone.trim()}` : '',
      notes.trim() ? `Notes: ${notes.trim()}` : '',
      '',
      'Note: Please confirm availability and final total.',
    ].filter(Boolean);

    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    setSentNotice(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#81766D]">
            <VegMark className="w-3.5 h-3.5" />
            <span>100% Pure Vegetarian</span>
            <span aria-hidden="true">·</span>
            <span>WhatsApp Order Request</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
            Your Order Bag
          </h1>
          <p className="text-sm text-[#81766D]">
            Review your items and send an order enquiry directly to our Gandhi Nagar, Kurnool counter. No online payment is collected on this page.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cart.length === 0 ? (
          <div className="max-w-lg mx-auto py-16 px-6 text-center rounded-3xl border border-[#EEE7DF] bg-[#FFF9F1]/40 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#EEE7DF] flex items-center justify-center text-[#F36B21]">
              <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-editorial text-3xl font-semibold text-[#28231F]">
                Your bag is currently empty
              </h2>
              <p className="text-sm text-[#81766D]">
                Add pizzas, croissants, brownies, cheesecakes, waffles, or coffees from our menu to prepare your order request.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/menu"
                className="px-6 py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Explore Menu
              </Link>
              <Link
                to="/cakes"
                className="px-6 py-3 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Custom Cake Enquiry
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Itemized List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EEE7DF] pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#28231F]">
                  Selected Items ({cartCount})
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-[#81766D] hover:text-[#C94E16]"
                >
                  Clear Bag
                </button>
              </div>

              <div className="divide-y divide-[#EEE7DF] border border-[#EEE7DF] rounded-2xl bg-white">
                {cart.map((item) => (
                  <div
                    key={item.cartKey}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#81766D]">{item.category}</p>
                      <h3 className="text-base font-semibold text-[#28231F]">
                        {item.name}
                        {item.variantLabel ? (
                          <span className="text-[#C94E16] font-medium">
                            {' '}
                            · {item.variantLabel}
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-xs text-[#81766D] tabular-nums">
                        ₹{item.unitPrice} per unit
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="inline-flex items-center border border-[#EEE7DF] rounded-full bg-[#FFF9F1]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartKey, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-9 h-9 inline-flex items-center justify-center text-[#28231F] hover:text-[#F36B21]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartKey, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-9 h-9 inline-flex items-center justify-center text-[#28231F] hover:text-[#F36B21]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-20 text-right text-base font-semibold text-[#28231F] tabular-nums">
                        ₹{item.unitPrice * item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartKey)}
                        aria-label={`Remove ${item.name}`}
                        className="w-9 h-9 inline-flex items-center justify-center rounded-full text-[#81766D] hover:text-[#C94E16] hover:bg-[#FFF9F1]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & WhatsApp Request Form */}
            <form
              onSubmit={handleSendOrderRequest}
              className="lg:col-span-5 rounded-3xl border border-[#EEE7DF] bg-[#FFF9F1] p-6 sm:p-8 space-y-6"
            >
              <h2 className="font-editorial text-3xl font-semibold text-[#28231F]">
                Order Request Summary
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="order-name" className="text-xs font-semibold text-[#28231F]">
                    Your Name *
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="order-phone" className="text-xs font-semibold text-[#28231F]">
                    Mobile Number *
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EEE7DF] text-sm tabular-nums focus:outline-none focus:border-[#F36B21]"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#28231F] block">
                    Preferred Option
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Store Pickup', 'Local Delivery Enquiry'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFulfillment(opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          fulfillment === opt
                            ? 'bg-[#28231F] text-white border-[#28231F]'
                            : 'bg-white text-[#28231F] border-[#EEE7DF] hover:border-[#F36B21]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="order-notes" className="text-xs font-semibold text-[#28231F]">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="order-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pickup time, spice preference, or delivery area in Kurnool..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EEE7DF] space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#81766D]">Estimated Subtotal</span>
                  <span className="text-2xl font-semibold text-[#28231F] tabular-nums">
                    ₹{cartSubtotal}
                  </span>
                </div>
                <p className="text-xs text-[#81766D] leading-relaxed">
                  This sends an order enquiry to 7th Heaven Bakery &amp; Cafe via WhatsApp. No payment has been processed; your order is confirmed once verified by our staff.
                </p>
              </div>

              {sentNotice && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-white border border-[#F36B21]/40 text-xs text-[#28231F]"
                >
                  WhatsApp order request window opened. Your bag items remain saved here until you clear them.
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Order Request via WhatsApp</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
