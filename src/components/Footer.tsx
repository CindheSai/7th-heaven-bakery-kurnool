import { Instagram, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBakery } from '../context/BakeryContext.tsx';
import { BrandLogoIcon, VegMark } from './BrandMark.tsx';

export function Footer() {
  const { settings } = useBakery();

  return (
    <footer className="bg-[#FFF9F1] border-t border-[#EEE7DF] text-[#28231F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <BrandLogoIcon className="w-8 h-8" />
              <span className="font-editorial text-2xl font-semibold tracking-tight">
                {settings.brandName}
              </span>
            </Link>
            <p className="text-sm text-[#81766D] leading-relaxed">
              Where delightful flavours, tempting desserts and comforting café favourites come together in Gandhi Nagar, Kurnool.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#28231F]">
              <VegMark className="w-4 h-4" />
              <span>{settings.positioning}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-[#F36B21] transition-colors">
                  Complete Café Menu
                </Link>
              </li>
              <li>
                <Link to="/cakes" className="hover:text-[#F36B21] transition-colors">
                  Cake Catalogue &amp; Custom Orders
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#F36B21] transition-colors">
                  Visual Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F36B21] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#F36B21] transition-colors">
                  Order Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Visit & Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
              Visit Us
            </h3>
            <div className="space-y-2.5 text-sm text-[#28231F]">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F36B21] shrink-0 mt-0.5" />
                <span>
                  {settings.addressLine1}, {settings.city}, {settings.state} {settings.postalCode},{' '}
                  {settings.country}
                </span>
              </p>
              <p className="text-[#81766D] pl-6">
                Hours: <span className="text-[#28231F] font-medium">{settings.hours}</span>
              </p>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
              Connect
            </h3>
            <div className="space-y-2.5 text-sm">
              <a
                href={`tel:+91${settings.phone}`}
                className="flex items-center gap-2.5 hover:text-[#F36B21] transition-colors tabular-nums"
              >
                <Phone className="w-4 h-4 text-[#F36B21]" />
                <span>{settings.phone}</span>
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#F36B21] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#F36B21]" />
                <span>{settings.instagramHandle}</span>
              </a>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#F36B21] text-[#C94E16] hover:bg-[#F36B21] hover:text-white text-xs font-semibold transition-colors"
                >
                  WhatsApp Enquiry
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#EEE7DF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#81766D]">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <span>Gandhi Nagar, Kurnool</span>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="hover:text-[#28231F] transition-colors">
              Store Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
