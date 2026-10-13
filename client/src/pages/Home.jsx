import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle2, 
  Flame, 
  Heart,
  Quote
} from 'lucide-react';
import { api } from '../api/client';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';
import SEO from '../components/common/SEO';

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  // 1. Fetch Categories
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  // 2. Fetch Featured Products (Bestsellers & New Arrivals)
  const { data: featData, isLoading: featLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.getFeatured(),
  });

  // 3. Fetch Settings
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const categories = catData?.categories || [];
  const bestsellers = featData?.bestsellers || [];
  const newArrivals = featData?.newArrivals || [];
  const settings = settingsData?.settings || {
    contactPhone: '+91 86974 49885',
    freeShippingThreshold: 999,
  };

  const handleQuickAdd = (product) => {
    const primaryVariant = product.variants?.[0] || { size: 'Standard', color: '' };
    addItem({
      productId: product._id,
      variantId: primaryVariant._id || `${product._id}-${primaryVariant.size}`,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
      size: primaryVariant.size,
      color: primaryVariant.color,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
    });
    openCartDrawer();
  };

  const testimonials = [
    {
      name: 'Moumita Mukherjee',
      city: 'Kolkata, WB',
      review: 'The Kantha cotton kurti is so soft and comfortable in Kolkata heat! The fit is true to size and color did not bleed even after 3 washes.',
      rating: 5,
    },
    {
      name: 'Sunita Sharma',
      city: 'Ranchi, Jharkhand',
      review: 'Ordered 2 nighties with pockets. Pure breathable cotton, great stitching and fast delivery via Delhivery in just 3 days.',
      rating: 5,
    },
    {
      name: 'Ananya Sen',
      city: 'Siliguri, WB',
      review: 'Kurti set fabric quality surprised me at this price point. Organza dupatta and pant fitting are fabulous for festive wear.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      <SEO
        title="KurtiKatha (কুর্টিকথা) — Handcrafted Ethnic Kurtis & Pure Cotton Nighties"
        description="Shop Kolkata's favourite handcrafted kurtis, breathable cotton nighties, and festive sets. Affordable daily wear fashion with Pan-India delivery and COD."
        url="/"
      />
      
      {/* 1. Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-elevated">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#E9C46A_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-20 lg:py-24 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-gold-300 text-xs sm:text-sm font-semibold tracking-wide mb-4 border border-white/20">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Kolkata Boutique Collection • Festive 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Comfort You Love, <br />
            <span className="text-gold-400 font-bengali font-bold">আসল বাঙালিয়ানা</span> Elegance.
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-cream-100 max-w-xl leading-relaxed">
            Discover lightweight cotton kurtis and super-comfortable daily nighties crafted for Indian weather. Direct from maker prices, no compromises.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 items-center">
            <Link
              to="/shop?category=kurtis"
              className="touch-target px-6 py-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-charcoal-900 font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Shop Kurtis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop?category=nighties"
              className="touch-target px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/30 backdrop-blur-sm transition-all"
            >
              Daily Nighties
            </Link>
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-cream-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400" />
              <span>100% Breathable Cotton</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400" />
              <span>Free Delivery Above ₹{settings.freeShippingThreshold}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Highlights */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Flame className="w-4 h-4" />
              <span>Curated Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link 
            to="/shop" 
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-4/5 rounded-2xl bg-cream-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white border border-cream-200 shadow-card hover:shadow-elevated transition-all flex flex-col"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-cream-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-brand-600 shadow-xs">
                    Popular
                  </span>
                </div>
                <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-charcoal-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-2.5 flex items-center text-xs font-semibold text-brand-500 group-hover:translate-x-1 transition-transform">
                    <span>Explore Collection &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Bestselling Products Strip (From Live DB) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
              <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
              Bestselling Kurtis & Nighties
            </h2>
          </div>
          <Link 
            to="/shop?bestseller=true" 
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-3/4 rounded-2xl bg-cream-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.slice(0, 8).map((prod) => {
              const discount = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
              return (
                <div
                  key={prod._id}
                  className="group bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col"
                >
                  <Link to={`/product/${prod.slug}`} className="relative aspect-3/4 overflow-hidden bg-cream-100 block">
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-500 text-white font-bold text-[10px] tracking-wide uppercase">
                      Bestseller
                    </span>
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gold-400 text-charcoal-900 font-extrabold text-[10px]">
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuickAdd(prod);
                      }}
                      className="absolute bottom-2 inset-x-2 py-2 px-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-xs text-brand-600 hover:bg-brand-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Quick Add</span>
                    </button>
                  </Link>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-charcoal-900">{prod.rating?.average || 4.8}</span>
                        <span>({prod.rating?.count || 45})</span>
                      </div>
                      <Link to={`/product/${prod.slug}`}>
                        <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                          {prod.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-3 pt-2 border-t border-cream-100 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-brand-600">₹{prod.price}</span>
                        {prod.mrp > prod.price && (
                          <span className="text-xs text-gray-400 line-through">₹{prod.mrp}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save ₹{prod.mrp - prod.price}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Customer Testimonials */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
            <Quote className="w-4 h-4" />
            <span>Real Customer Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            Loved Across Homes in India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-card space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>
              <div className="pt-3 border-t border-cream-100 flex items-center justify-between text-xs">
                <span className="font-bold text-charcoal-900">{t.name}</span>
                <span className="text-gray-400">{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Heritage Promise Banner */}
      <section className="rounded-3xl bg-cream-100 border border-cream-300 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-inner">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>The KurtiKatha Promise</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            Real Cotton, Made for Everyday Indian Living
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every kurti and nighty at KurtiKatha is sampled for breathability, color-fastness, and durable stitching. Whether you are running household errands, working from home, or dressing up for a family gathering — we keep you feeling light and looking effortless.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-charcoal-900">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" /> 100% Pre-Shrunk Fabric
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-500" /> Non-Bleed Block Prints
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-brand-500" /> 4.8★ Average Rating
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`tel:${settings.contactPhone}`}
            className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-brand-300 text-brand-600 font-bold text-sm text-center shadow-xs hover:bg-brand-50 transition-colors"
          >
            Call: {settings.contactPhone}
          </a>
          <Link
            to="/shop"
            className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-brand-500 text-white font-bold text-sm text-center shadow-sm hover:bg-brand-600 transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </section>

    </div>
  );
}
