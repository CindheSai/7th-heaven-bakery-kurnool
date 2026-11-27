import {
  ArrowRight,
  Box,
  CakeSlice,
  Camera,
  Clock,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { lazy, startTransition, Suspense, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SafeImage, VegMark } from '../components/BrandMark.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { MenuItemCard } from '../components/MenuItemCard.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import { IMAGES } from '../data/seedData.ts';

const HeroPatisserie3D = lazy(() =>
  import('../components/HeroPatisserie3D.tsx').then((mod) => ({
    default: mod.HeroPatisserie3D,
  }))
);

interface ExperienceCard {
  title: string;
  description: string;
  image: string;
  to: string;
}

const EXPERIENCES: ExperienceCard[] = [
  {
    title: 'Signature Cakes',
    description:
      'Classic, Exotic, Supreme, Indian fusion, Photo, Shape, and 3D customised celebration cakes.',
    image: IMAGES.signatureCakes,
    to: '/cakes',
  },
  {
    title: 'Cheesecakes',
    description:
      'Velvety no-bake and rich oven-baked cheesecakes in Lotus Biscoff, Nutella, and berry varieties.',
    image: IMAGES.cheesecakes,
    to: '/menu?category=Baked%20Cheesecakes',
  },
  {
    title: 'Brownies & Desserts',
    description:
      'Fudgy brownies, French macarons, cake bowls, tub desserts, glass mousses, and tarts.',
    image: IMAGES.browniesDesserts,
    to: '/menu?category=Brownies',
  },
  {
    title: 'Waffles',
    description:
      'Warm golden waffles finished with honey butter, cream cheese, Nutella, or vanilla ice cream.',
    image: IMAGES.waffles,
    to: '/menu?category=Waffles',
  },
  {
    title: 'Savoury Bites',
    description:
      'Flaky croissants, Korean cheese buns, burgers, focaccia, pizzas, fried momos, and fries.',
    image: IMAGES.savouryBites,
    to: '/menu?section=Savouries%20%26%20Sips',
  },
  {
    title: 'Coffee & Beverages',
    description:
      'Specialty hot coffees, tiramisu & hazelnut cold frappes, milkshakes, and fruit refreshers.',
    image: IMAGES.coffeeBeverages,
    to: '/menu?category=Cold%20Coffee',
  },
];

const FEATURED_ITEM_IDS = [
  'sav-snack-bread-korean-cheese-bun',
  'swt-baked-cheesecakes-lotus-biscoff',
  'swt-cake-bowl-triple-chocolate',
  'swt-brownies-lotus-biscoff',
  'sav-cold-coffee-tiramisu',
  'sav-pizza-paneer',
];

export function HomePage() {
  const { settings, menuItems, cakeCollections } = useBakery();
  const [heroMode, setHeroMode] = useState<'photo' | '3d'>('photo');
  const navigate = useNavigate();

  const mapsDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.brandName}, ${settings.addressLine1}, ${settings.city}, ${settings.state} ${settings.postalCode}`
  )}`;

  const featuredMenuItems = useMemo(() => {
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    const picked = FEATURED_ITEM_IDS.map((id) => byId.get(id)).filter(
      (item): item is NonNullable<typeof item> => Boolean(item && item.available)
    );
    if (picked.length >= 6) return picked;
    return menuItems.filter((m) => m.available).slice(0, 6);
  }, [menuItems]);

  const popularCategories = useMemo(() => {
    const counts = new Map<string, { section: string; count: number }>();
    for (const item of menuItems) {
      const existing = counts.get(item.category);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(item.category, { section: item.section, count: 1 });
      }
    }
    return Array.from(counts.entries()).slice(0, 10);
  }, [menuItems]);

  const signatureCakes = useMemo(
    () => cakeCollections.slice(0, 4),
    [cakeCollections]
  );

  return (
    <div className="bg-white">
      {/* SUBTLE PROMO BANNER */}
      {settings.promoBanner && (
        <div className="bg-[#FFF9F1] border-b border-[#EEE7DF] px-4 py-2 text-center">
          <p className="text-xs font-medium text-[#C94E16] inline-flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-3.5 h-3.5 text-[#F36B21] shrink-0" />
            <span>{settings.promoBanner}</span>
          </p>
        </div>
      )}

      {/* B. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#EEE7DF]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#F36B21]/[0.05] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 w-[320px] h-[320px] rounded-full bg-[#FFF9F1] blur-2xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-7"
            >
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-[#81766D]">
                <span className="inline-flex items-center gap-1.5 text-[#28231F] font-semibold">
                  <VegMark className="w-3.5 h-3.5" />
                  <span>{settings.positioning}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Gandhi Nagar, {settings.city}</span>
                <span aria-hidden="true">·</span>
                <span>{settings.hours}</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold tracking-tight text-[#28231F] leading-[1.06]">
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#81766D] leading-relaxed max-w-xl">
                {settings.heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F36B21]"
                >
                  <span>Explore Our Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cakes')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs sm:text-sm font-semibold tracking-wide uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#28231F]"
                >
                  <span>Discover Our Cakes</span>
                </button>
              </div>
            </motion.div>

            {/* Hero Visual Stage (Photo + Lazy-loaded Interactive 3D Toggle) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[28px] overflow-hidden border border-[#EEE7DF] bg-[#FFF9F1] shadow-[0_24px_60px_rgba(40,35,31,0.08)]">
                <div className="aspect-[4/3] w-full">
                  {heroMode === 'photo' ? (
                    <SafeImage
                      src={IMAGES.heroCake}
                      alt="Layered Belgian chocolate and salted caramel patisserie cake on marble pedestal"
                      loading="eager"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ErrorBoundary
                      fallback={
                        <SafeImage
                          src={IMAGES.heroCake}
                          alt="Layered Belgian chocolate patisserie cake"
                          loading="eager"
                          className="w-full h-full object-cover"
                        />
                      }
                    >
                      <Suspense
                        fallback={
                          <div className="w-full h-full flex items-center justify-center bg-[#FFF9F1] text-xs font-medium text-[#81766D]">
                            Loading 3D patisserie studio...
                          </div>
                        }
                      >
                        <HeroPatisserie3D
                          fallbackImage={IMAGES.heroCake}
                          fallbackAlt="3D Patisserie Centerpiece"
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )}
                </div>

                {/* Clean View Mode Switcher */}
                <div className="px-4 py-3 bg-white/95 border-t border-[#EEE7DF] flex items-center justify-between gap-3">
                  <span className="text-xs text-[#81766D] truncate">
                    {heroMode === 'photo'
                      ? 'Representative patisserie presentation'
                      : 'Interactive 3D patisserie studio'}
                  </span>
                  <div
                    className="inline-flex items-center p-1 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] shrink-0"
                    role="group"
                    aria-label="Hero showcase view mode"
                  >
                    <button
                      type="button"
                      onClick={() => startTransition(() => setHeroMode('photo'))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                        heroMode === 'photo'
                          ? 'bg-white text-[#28231F] shadow-xs'
                          : 'text-[#81766D] hover:text-[#28231F]'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startTransition(() => setHeroMode('3d'))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                        heroMode === '3d'
                          ? 'bg-white text-[#28231F] shadow-xs'
                          : 'text-[#81766D] hover:text-[#28231F]'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>3D View</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES QUICK STRIP */}
      <section className="py-10 bg-white border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#81766D]">
              Popular Menu Categories
            </p>
            <Link
              to="/menu"
              className="text-xs font-semibold text-[#C94E16] hover:text-[#F36B21] whitespace-nowrap"
            >
              Browse all {menuItems.length} items →
            </Link>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {popularCategories.map(([category, info]) => (
              <Link
                key={category}
                to={`/menu?category=${encodeURIComponent(category)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF9F1] border border-[#EEE7DF] hover:border-[#F36B21] text-xs font-medium text-[#28231F] whitespace-nowrap shrink-0 transition-colors"
              >
                <span>{category}</span>
                <span className="text-[11px] text-[#81766D] tabular-nums">
                  {info.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C. BRAND INTRODUCTION */}
      <section className="py-16 sm:py-24 bg-[#FFF9F1]/60 border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#EEE7DF] bg-white min-h-[280px]"
            >
              <SafeImage
                src={IMAGES.cafeInterior}
                alt="Bright sunlit contemporary bakery and café interior styling"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C94E16]">
                <VegMark className="w-4 h-4" />
                <span>{settings.positioning}</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#28231F] leading-tight">
                Made to Make Every Moment Sweeter.
              </h2>

              <p className="text-base text-[#81766D] leading-relaxed">
                Welcome to {settings.brandName}, where delightful flavours, tempting desserts and comforting café favourites come together.
              </p>

              <p className="text-sm sm:text-base text-[#81766D] leading-relaxed">
                Serving Gandhi Nagar, {settings.city} with an entirely 100% pure vegetarian menu—from classic and custom celebration cakes to baked cheesecakes, waffles, brownies, warm savouries, and cold coffee frappes.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-sm text-[#28231F]">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 font-semibold text-[#C94E16] hover:text-[#F36B21] transition-colors"
                >
                  <span>Read About 7th Heaven</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[#81766D]">·</span>
                <span className="text-[#81766D]">Open {settings.hours}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED CAFE PICKS */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                Fresh From The Counter
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#28231F]">
                Café Favourites &amp; Signatures
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#28231F] hover:text-[#F36B21] transition-colors shrink-0"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMenuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* D. SIGNATURE EXPERIENCES */}
      <section className="py-16 sm:py-24 bg-[#FFF9F1]/40 border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                Signature Experiences
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#28231F]">
                Crafted for Celebrations &amp; Everyday Cravings
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#28231F] hover:text-[#F36B21] transition-colors shrink-0"
            >
              <span>View Full Digital Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {EXPERIENCES.map((exp, idx) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
              >
                <Link
                  to={exp.to}
                  className="group rounded-2xl border border-[#EEE7DF] bg-white overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(40,35,31,0.08)] h-full flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#FFF9F1]">
                    <SafeImage
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-editorial text-2xl font-semibold text-[#28231F] group-hover:text-[#C94E16] transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-[#81766D] leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE CAKE COLLECTIONS PREVIEW */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                Celebration &amp; Custom Cakes
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#28231F]">
                13 Collections Made to Order
              </h2>
            </div>
            <Link
              to="/cakes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#28231F] hover:text-[#F36B21] transition-colors shrink-0"
            >
              <span>Explore All 13 Cake Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {signatureCakes.map((col) => (
              <Link
                key={col.id}
                to={`/cakes?collection=${col.slug}`}
                className="group rounded-2xl border border-[#EEE7DF] bg-[#FFF9F1]/40 overflow-hidden hover:border-[#F36B21] transition-colors flex flex-col justify-between"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#FFF9F1]">
                  <SafeImage
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#81766D]">
                    <span className="inline-flex items-center gap-1 text-[#C94E16] font-semibold">
                      <CakeSlice className="w-3.5 h-3.5" />
                      <span>{col.flavours.length} flavours</span>
                    </span>
                    {col.halfKgPrice && (
                      <span className="font-semibold text-[#28231F] tabular-nums">
                        From ₹{col.halfKgPrice}
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#28231F] group-hover:text-[#C94E16] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-[#81766D] line-clamp-2">{col.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT US / LOCATION STRIP */}
      <section className="py-16 bg-[#F8F0E5]/55 border-t border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-[#EEE7DF] p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                Visit Us in {settings.city}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#28231F]">
                {settings.addressLine1}, {settings.city}
              </h2>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#81766D] pt-1">
                <span className="inline-flex items-center gap-2 text-[#28231F]">
                  <Clock className="w-4 h-4 text-[#F36B21]" />
                  <span>{settings.hours}</span>
                </span>
                <a
                  href={`tel:+91${settings.phone}`}
                  className="inline-flex items-center gap-2 text-[#28231F] hover:text-[#F36B21] tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#F36B21]" />
                  <span>{settings.phone}</span>
                </a>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F36B21]" />
                  <span>
                    {settings.state} {settings.postalCode}
                  </span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              <a
                href={mapsDirectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Get Directions
              </a>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Contact &amp; Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
