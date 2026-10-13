import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal, 
  X, 
  Star, 
  ShoppingBag,
  Check
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

const SAMPLE_CATALOG = [
  {
    id: 'cat-1',
    title: 'Jaipuri Hand-Block Print Flared Pure Cotton Kurti',
    category: 'kurtis',
    fabric: '100% Cotton',
    price: 649,
    mrp: 1199,
    rating: 4.8,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-2',
    title: 'Floral Summer Alpine Nighty with Front Zipper & Pocket',
    category: 'nighties',
    fabric: 'Pure Cotton',
    price: 499,
    mrp: 899,
    rating: 4.9,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=600&auto=format&fit=crop&q=80',
    sizes: ['Free Size', 'XL', 'XXL'],
  },
  {
    id: 'cat-3',
    title: 'Mustard Yellow Straight Office Kurti with Side Slit',
    category: 'kurtis',
    fabric: 'Khadi Cotton',
    price: 599,
    mrp: 1099,
    rating: 4.7,
    reviews: 58,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'cat-4',
    title: 'Traditional Bengali Batik Print Cotton Nighty',
    category: 'nighties',
    fabric: '100% Cotton',
    price: 449,
    mrp: 799,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    sizes: ['Free Size', 'L', 'XL'],
  },
  {
    id: 'cat-5',
    title: 'Crimson Festive Kurti with Pant & Organza Dupatta',
    category: 'kurti-sets',
    fabric: 'Rayon Slub',
    price: 1399,
    mrp: 2699,
    rating: 4.9,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-6',
    title: 'Pastel Mint Embroidered Yoke A-Line Kurti',
    category: 'kurtis',
    fabric: 'Cotton Blend',
    price: 749,
    mrp: 1399,
    rating: 4.6,
    reviews: 41,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
  },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [sortBy, setSortBy] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const filteredProducts = SAMPLE_CATALOG.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Breadcrumb */}
      <div className="bg-cream-100 rounded-2xl p-6 border border-cream-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 capitalize">
          {selectedCategory === 'all' ? 'All Kurtis & Nighties' : `${selectedCategory.replace('-', ' ')} Collection`}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Showing {filteredProducts.length} handcrafted pieces crafted from soft breathable fabrics
        </p>
      </div>

      {/* 2. Controls Bar (Filter trigger & Sort) */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-cream-200">
        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="touch-target lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-cream-300 text-xs font-bold text-charcoal-900 shadow-2xs"
        >
          <Filter className="w-4 h-4 text-brand-500" />
          <span>Filters</span>
        </button>

        {/* Desktop Quick Category Tabs */}
        <div className="hidden lg:flex items-center gap-2">
          {['all', 'kurtis', 'nighties', 'kurti-sets'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-white border border-cream-300 text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="popular">Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* 3. Catalog Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="group bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col"
          >
            <div className="relative aspect-3/4 overflow-hidden bg-cream-100">
              <img
                src={prod.image}
                alt={prod.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-gold-400 text-charcoal-900 font-extrabold text-[10px]">
                {Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)}% OFF
              </span>
              <button
                type="button"
                onClick={() => handleQuickAdd(prod)}
                className="absolute bottom-2 inset-x-2 py-2 px-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-xs text-brand-600 hover:bg-brand-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>

            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-medium text-brand-600 uppercase tracking-wider">
                  {prod.fabric}
                </p>
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug mt-0.5">
                  {prod.title}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-cream-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-brand-600">₹{prod.price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{prod.mrp}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{prod.rating}</span>
                  <span>({prod.reviews})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Mobile Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileFilterOpen(false)} 
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-elevated z-50 p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="text-base font-bold text-charcoal-900">Filter By Category</h3>
              <button 
                type="button" 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-charcoal-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {['all', 'kurtis', 'nighties', 'kurti-sets'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold capitalize ${
                    selectedCategory === cat ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-cream-50 text-charcoal-900'
                  }`}
                >
                  <span>{cat.replace('-', ' ')}</span>
                  {selectedCategory === cat && <Check className="w-4 h-4 text-brand-500" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl shadow-md text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

