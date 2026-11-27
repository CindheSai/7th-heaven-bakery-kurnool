import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import React, { useState } from 'react';
import { VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';

export function ContactPage() {
  const { settings } = useBakery();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fullAddress = `${settings.addressLine1}, ${settings.city}, ${settings.state} ${settings.postalCode}, ${settings.country}`;
  const mapsQuery = encodeURIComponent(`${settings.brandName}, ${fullAddress}`);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const embedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedId(null);

    if (name.trim().length < 2) {
      setFormError('Please enter your name.');
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(phone.trim())) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please write a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not send your message.');
      }
      setSubmittedId(data.contact.id);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C94E16]">
            <VegMark className="w-4 h-4" />
            <span>{settings.positioning}</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#28231F]">
            Visit &amp; Contact Us
          </h1>
          <p className="text-sm sm:text-base text-[#81766D] max-w-2xl">
            Stop by our Gandhi Nagar café in {settings.city}, connect by phone or WhatsApp, or send us a message below for party trays, feedback, and enquiries.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#EEE7DF] bg-[#FFF9F1]/60 p-7 sm:p-9 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <h2 className="font-editorial text-3xl font-semibold text-[#28231F]">
                  {settings.brandName}
                </h2>
                <p className="text-xs text-[#81766D] mt-1">{settings.tagline}</p>
              </div>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-[#F36B21] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Address
                    </p>
                    <p className="text-[#28231F] font-medium mt-0.5 leading-relaxed">
                      {settings.addressLine1},
                      <br />
                      {settings.city}, {settings.state} {settings.postalCode},
                      <br />
                      {settings.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-[#F36B21] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Opening Hours
                    </p>
                    <p className="text-[#28231F] font-medium mt-0.5">{settings.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-[#F36B21] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Phone
                    </p>
                    <a
                      href={`tel:+91${settings.phone}`}
                      className="text-[#28231F] hover:text-[#F36B21] font-semibold mt-0.5 inline-block tabular-nums"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Instagram className="w-5 h-5 text-[#F36B21] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
                      Instagram
                    </p>
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#28231F] hover:text-[#F36B21] font-semibold mt-0.5 inline-flex items-center gap-1.5"
                    >
                      <span>{settings.instagramHandle}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EEE7DF] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:+91${settings.phone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#EEE7DF] hover:border-[#F36B21] text-[#28231F] text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F36B21]" />
                <span>Get Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="lg:col-span-7 rounded-3xl border border-[#EEE7DF] overflow-hidden bg-[#FFF9F1] min-h-[380px] flex flex-col">
            <iframe
              title="7th Heaven Bakery & Cafe Gandhi Nagar Kurnool Map"
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[380px] border-0 flex-1"
            />
          </div>
        </div>

        {/* Contact Form */}
        <section className="rounded-3xl border border-[#EEE7DF] bg-[#FFF9F1]/40 p-7 sm:p-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                Send Us a Message
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#28231F]">
                Questions, Bulk Orders &amp; Feedback
              </h2>
              <p className="text-sm text-[#81766D]">
                Leave your contact details and message below—our {settings.city} counter team will get back to you promptly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-[#EEE7DF] p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-[#28231F]">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-semibold text-[#28231F]">
                    Mobile Number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm tabular-nums focus:outline-none focus:border-[#F36B21]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-[#28231F]">
                    Email Address (Optional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-semibold text-[#28231F]">
                    Topic *
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm bg-white focus:outline-none focus:border-[#F36B21]"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Bulk / Event / Party Order">Bulk / Event / Party Order</option>
                    <option value="Custom Cake Consultation">Custom Cake Consultation</option>
                    <option value="Feedback & Suggestions">Feedback &amp; Suggestions</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold text-[#28231F]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our Gandhi Nagar bakery & café team help you?"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EEE7DF] text-sm focus:outline-none focus:border-[#F36B21]"
                />
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

              {submittedId && (
                <div
                  role="status"
                  className="p-4 rounded-xl bg-[#FFF9F1] border border-[#F36B21]/40 text-xs text-[#28231F] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F36B21] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#C94E16]">
                      Message received ({submittedId})
                    </p>
                    <p className="text-[#81766D] mt-0.5">
                      Thank you for reaching out to {settings.brandName}. Our team will follow up with you shortly.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
