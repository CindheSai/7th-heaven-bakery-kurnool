import {
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import type { OrderRequest } from '../types/bakery.ts';

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order: OrderRequest;
    whatsappUrl: string;
  } | null>(null);

  const buildWhatsAppUrl = (order: OrderRequest) => {
    const lines = [
      `Hello ${settings.brandName}, here is my Order Request (${order.id}):`,
      '',
      ...order.items.map(
        (item, i) =>
          `${i + 1}. ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} × ${
            item.quantity
          } = ₹${item.unitPrice * item.quantity}`
      ),
      '',
      `Estimated Subtotal: ₹${order.estimatedSubtotal}`,
      `Order Type: ${order.fulfillment}`,
      `Customer Name: ${order.customerName}`,
      `Phone: ${order.mobileNumber}`,
      order.notes ? `Notes: ${order.notes}` : '',
      '',
      'Note: Please confirm availability and final total.',
    ].filter(Boolean);

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
  };

  const handleSendOrderRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setFormError(null);
    if (customerName.trim().length < 2) {
      setFormError('Please enter your name.');
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(customerPhone.trim())) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobileNumber: customerPhone.trim(),
          fulfillment,
          notes: notes.trim() || undefined,
          items: cart.map((c) => ({
            itemId: c.itemId,
            variantLabel: c.variantLabel,
            quantity: c.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit your order request.');
      }

      const whatsappUrl = buildWhatsAppUrl(data.order);
      setConfirmedOrder({ order: data.order, whatsappUrl });
      clearCart();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#81766D]">
            <VegMark className="w-3.5 h-3.5" />
            <span>100% Pure Vegetarian</span>
            <span aria-hidden="true">·</span>
            <span>Counter Order Request</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
            Your Order Bag
          </h1>
          <p className="text-sm text-[#81766D]">
            Submit an order request to our Gandhi Nagar, {settings.city} counter and optionally continue via WhatsApp. No online payment is collected on this page.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {confirmedOrder ? (
          <div className="max-w-2xl mx-auto rounded-3xl border border-[#F36B21]/40 bg-[#FFF9F1] p-7 sm:p-10 space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#F36B21] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C94E16]">
                  Order Request Recorded · {confirmedOrder.order.id}
                </p>
                <h2 className="font-editorial text-3xl font-semibold text-[#28231F]">
                  Thank you, {confirmedOrder.order.customerName}
                </h2>
                <p className="text-sm text-[#81766D]">
                  Your request has been saved for our {settings.city} team ({confirmedOrder.order.fulfillment}). No online payment was processed; our counter confirms availability and final billing directly.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#EEE7DF] p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                Requested Items
              </p>
              <ul className="divide-y divide-[#EEE7DF] text-sm">
                {confirmedOrder.order.items.map((it, idx) => (
                  <li
                    key={`${it.itemId}-${idx}`}
                    className="py-2 flex items-center justify-between gap-4"
                  >
                    <span>
                      {it.name}
                      {it.variantLabel ? ` (${it.variantLabel})` : ''} × {it.quantity}
                    </span>
                    <span className="font-semibold tabular-nums">
                      ₹{it.unitPrice * it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-[#EEE7DF] flex items-baseline justify-between">
                <span className="text-sm text-[#81766D]">Estimated Subtotal</span>
                <span className="text-xl font-semibold text-[#28231F] tabular-nums">
                  ₹{confirmedOrder.order.estimatedSubtotal}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={confirmedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Copy via WhatsApp</span>
              </a>
              <Link
                to="/menu"
                className="px-6 py-3 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
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

            {/* Order Summary & Persisted Request Form */}
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
                  Submitting saves your order request for {settings.brandName} ({settings.city}). No online payment is collected; our staff confirms availability and final billing.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#F36B21] hover:bg-[#C94E16] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{submitting ? 'Submitting Order Request...' : 'Submit Order Request'}</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
