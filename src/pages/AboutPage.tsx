import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage, VegMark } from '../components/BrandMark.tsx';
import { useBakery } from '../context/BakeryContext.tsx';
import { IMAGES } from '../data/seedData.ts';

export function AboutPage() {
  const { settings } = useBakery();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#FFF9F1] border-b border-[#EEE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C94E16]">
            <VegMark className="w-4 h-4" />
            <span>{settings.positioning}</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#28231F] max-w-3xl">
            A Little Taste of Happiness.
          </h1>
          <p className="text-base sm:text-lg text-[#81766D] max-w-2xl leading-relaxed">
            Welcome to {settings.brandName} in Gandhi Nagar, Kurnool—a welcoming patisserie and café built around 100% pure vegetarian baking, celebration cakes, indulgent desserts, and comforting savoury favourites.
          </p>
        </div>
      </section>

      {/* Editorial Story & Cafe Space */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#EEE7DF] aspect-[4/3]">
            <SafeImage
              src={IMAGES.cafeInterior}
              alt="Representative bakery and café interior"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#28231F]">
              100% Pure Vegetarian Bakery &amp; Café Experience
            </h2>
            <p className="text-sm sm:text-base text-[#81766D] leading-relaxed">
              Every item across our Savouries &amp; Sips menu, Sweet Side counter, and Celebration Cake catalogue is strictly 100% pure vegetarian. Whether you are dropping in for an afternoon cappuccino and Korean cheese bun or commissioning a multi-tiered fondant centrepiece, every visit is crafted to feel warm and memorable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#FFF9F1] border border-[#EEE7DF] space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                  Location
                </p>
                <p className="text-sm font-medium text-[#28231F] flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#F36B21] shrink-0 mt-0.5" />
                  <span>
                    {settings.addressLine1}, {settings.city}, {settings.state} {settings.postalCode}
                  </span>
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFF9F1] border border-[#EEE7DF] space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
                  Opening Hours
                </p>
                <p className="text-sm font-medium text-[#28231F] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F36B21] shrink-0" />
                  <span>Daily · {settings.hours}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Product Categories */}
        <div className="pt-8 border-t border-[#EEE7DF] space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
              What We Serve
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#28231F]">
              Signature Offerings Across Bakery &amp; Café
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#EEE7DF] bg-white space-y-3">
              <h3 className="font-editorial text-2xl font-semibold text-[#28231F]">
                Celebration &amp; Custom Cakes
              </h3>
              <p className="text-sm text-[#81766D] leading-relaxed">
                Classic, Premium, Exotic, Premium Exotic, Supreme, Pie Cakes, Indian fusion flavours like Rasmalai and Motichoor, Ice Cream Cakes, Photo Cakes, Shape Cakes, and 3D Customised fondant cakes.
              </p>
              <Link
                to="/cakes"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C94E16] hover:text-[#F36B21]"
              >
                <span>Explore Cakes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-[#EEE7DF] bg-white space-y-3">
              <h3 className="font-editorial text-2xl font-semibold text-[#28231F]">
                Patisserie &amp; Sweet Side
              </h3>
              <p className="text-sm text-[#81766D] leading-relaxed">
                No-bake and oven-baked cheesecakes, fudgy brownies, French macarons, donuts, waffles, cake &amp; brownie bowls, tub desserts, glass desserts, tarts, and ice cream scoops.
              </p>
              <Link
                to="/menu?section=Sweet%20Side"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C94E16] hover:text-[#F36B21]"
              >
                <span>Explore Sweet Side</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-[#EEE7DF] bg-white space-y-3">
              <h3 className="font-editorial text-2xl font-semibold text-[#28231F]">
                Savouries &amp; Café Sips
              </h3>
              <p className="text-sm text-[#81766D] leading-relaxed">
                Puffs, croissants, burgers, focaccia, Korean cheese buns, sandwiches, 6-inch &amp; 8-inch pizzas, fried momos, fries, loaf breads, milkshakes, refreshers, cold frappes, and hot coffee.
              </p>
              <Link
                to="/menu?section=Savouries%20%26%20Sips"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C94E16] hover:text-[#F36B21]"
              >
                <span>Explore Savouries &amp; Sips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
