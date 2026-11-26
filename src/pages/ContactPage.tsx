import { Clock, ExternalLink, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import { VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';

export function ContactPage() {
  const { settings } = useBakery();

  const fullAddress = `${settings.addressLine1}, ${settings.city}, ${settings.state} ${settings.postalCode}, ${settings.country}`;
  const mapsQuery = encodeURIComponent(`${settings.brandName}, ${fullAddress}`);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const embedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

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
            Stop by our Gandhi Nagar café in Kurnool or connect directly by phone, WhatsApp, or Instagram for orders and custom cake enquiries.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
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
                      {settings.addressLine1},<br />
                      {settings.city}, {settings.state} {settings.postalCode},<br />
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
      </main>
    </div>
  );
}
