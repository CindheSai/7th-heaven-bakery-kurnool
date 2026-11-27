import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useBakery } from '../context/BakeryContext.tsx';
import { BrandLogoIcon } from './BrandMark.tsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/cakes', label: 'Cakes' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const { cartCount, setIsCartOpen, setIsSearchOpen, settings } = useBakery();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-[#EEE7DF] shadow-[0_1px_12px_rgba(40,35,31,0.04)]'
            : 'bg-white/90 backdrop-blur-sm border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21] rounded-md py-1"
            aria-label="7th Heaven Bakery & Cafe Home"
          >
            <BrandLogoIcon className="w-8 h-8 shrink-0" />
            <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#28231F]">
              7th Heaven
            </span>
          </Link>

          {/* Zone 2: Clean Typography Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#81766D]"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21] rounded ${
                    isActive
                      ? 'text-[#28231F] font-semibold'
                      : 'hover:text-[#F36B21]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#F36B21] rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Search, Shopping Bag & Primary Order Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search menu and cakes"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[#28231F] hover:bg-[#FFF9F1] hover:text-[#F36B21] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21]"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open order bag (${cartCount} items)`}
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-full text-[#28231F] hover:bg-[#FFF9F1] hover:text-[#F36B21] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21]"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F36B21] text-white text-[10px] font-semibold tabular-nums flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-wide text-white bg-[#F36B21] hover:bg-[#C94E16] rounded-full transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F36B21]"
            >
              Order Now
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
              className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full text-[#28231F] hover:bg-[#FFF9F1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F36B21]"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="fixed inset-0 bg-[#28231F]/30 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl border-l border-[#EEE7DF] flex flex-col p-6">
            <div className="flex items-center justify-between pb-5 border-b border-[#EEE7DF]">
              <div className="flex items-center gap-2.5">
                <BrandLogoIcon className="w-7 h-7" />
                <span className="font-editorial text-xl font-semibold text-[#28231F]">
                  7th Heaven
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full text-[#81766D] hover:bg-[#FFF9F1] hover:text-[#28231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 py-6 flex-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FFF9F1] text-[#C94E16] font-semibold'
                        : 'text-[#28231F] hover:bg-[#FFF9F1]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#FFF9F1] text-[#C94E16] font-semibold'
                      : 'text-[#28231F] hover:bg-[#FFF9F1]'
                  }`
                }
              >
                <span>Order Bag</span>
                <span className="text-xs tabular-nums text-[#81766D]">
                  {cartCount} items
                </span>
              </NavLink>
            </nav>

            <div className="pt-4 border-t border-[#EEE7DF] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/menu');
                }}
                className="w-full py-3 px-4 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-sm font-semibold transition-colors"
              >
                Order Now
              </button>
              <p className="text-xs text-[#81766D] text-center">
                Open Daily · {settings.hours}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
