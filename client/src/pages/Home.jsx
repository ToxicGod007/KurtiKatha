import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Heart, 
  ShoppingBag, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

// Curated sample showcase items for layout preview
const SAMPLE_PRODUCTS = [
  {
    id: 'sample-1',
    title: 'Kolkata Kantha Floral Pure Cotton Kurti',
    category: 'Kurtis',
    mrp: 1299,
    price: 699,
    discount: '46% OFF',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    tag: 'Bestseller',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'sample-2',
    title: 'Breezy Indigo Block Print Nighty (100% Cotton)',
    category: 'Nighties',
    mrp: 899,
    price: 499,
    discount: '44% OFF',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=600&auto=format&fit=crop&q=80',
    tag: 'Popular',
    sizes: ['Free Size', 'L', 'XL', 'XXL'],
  },
  {
    id: 'sample-3',
    title: 'Festive Crimson Rayon Anarkali Kurti & Dupatta',
    category: 'Kurti Sets',
    mrp: 2499,
    price: 1299,
    discount: '48% OFF',
    rating: 4.7,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    tag: 'Festive Pick',
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 'sample-4',
    title: 'Soft Pastel Floral Alpine Nighty with Pocket',
    category: 'Nighties',
    mrp: 999,
    price: 549,
    discount: '45% OFF',
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    tag: 'Must Have',
    sizes: ['Free Size', 'XL', 'XXL'],
  },
];

const CATEGORIES = [
  {
    name: 'Kurtis',
    bengali: 'কুুর্তি',
    desc: 'Straight, A-line & Anarkali in soft cotton',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80',
    link: '/shop?category=kurtis',
    badge: 'From ₹499',
  },
  {
    name: 'Nighties',
    bengali: 'নাইটি',
    desc: 'Pure breathable cotton nightwear for Indian summers',
    image: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=500&auto=format&fit=crop&q=80',
    link: '/shop?category=nighties',
    badge: 'From ₹399',
  },
  {
    name: 'Kurti Sets',
    bengali: 'কুুর্তি সেট',
    desc: 'Co-ordinated kurti, pant & dupatta festive sets',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    link: '/shop?category=kurti-sets',
    badge: 'Under ₹1499',
  },
  {
    name: 'New Arrivals',
    bengali: 'নতুন কালেকশন',
    desc: 'Fresh artisan prints and modern ethnic cuts',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
    link: '/shop?filter=new',
    badge: 'Just Dropped',
  },
];

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const handleQuickAdd = (product) => {
    addItem({
      productId: product.id,
      variantId: `${product.id}-${product.sizes[0]}`,
      title: product.title,
      slug: product.id,
      image: product.image,
      size: product.sizes[0],
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
    });
    openCartDrawer();
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      
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
              <span>Free Delivery Above ₹999</span>
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
              <span>Curated Sections</span>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
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
                  {cat.badge}
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="font-bold text-charcoal-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="font-bengali text-xs text-gold-600 font-bold">
                      ({cat.bengali})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center text-xs font-semibold text-brand-500 group-hover:translate-x-1 transition-transform">
                  <span>Explore &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Bestsellers */}
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
            to="/shop?filter=bestsellers" 
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {SAMPLE_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-3/4 overflow-hidden bg-cream-100">
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-500 text-white font-bold text-[10px] tracking-wide uppercase">
                  {prod.tag}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gold-400 text-charcoal-900 font-extrabold text-[10px]">
                  {prod.discount}
                </span>

                {/* Quick Add Button overlay */}
                <button
                  type="button"
                  onClick={() => handleQuickAdd(prod)}
                  className="absolute bottom-2 inset-x-2 py-2 px-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-xs text-brand-600 hover:bg-brand-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-charcoal-900">{prod.rating}</span>
                    <span>({prod.reviews})</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                    {prod.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-cream-100 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-bold text-brand-600">₹{prod.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{prod.mrp}</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Save ₹{prod.mrp - prod.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Boutique Heritage Banner */}
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
            href="tel:+918697449885"
            className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-brand-300 text-brand-600 font-bold text-sm text-center shadow-xs hover:bg-brand-50 transition-colors"
          >
            Call: +91 86974 49885
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

