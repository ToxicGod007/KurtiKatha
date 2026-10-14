import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal, 
  X, 
  Star, 
  ShoppingBag,
  Check,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';
import SEO from '../components/common/SEO';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';
  const sortParam = searchParams.get('sort') || 'popularity';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local filter states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [searchInput, setSearchInput] = useState(searchParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  // Prevent background body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        const nextParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          nextParams.set('search', searchInput.trim());
        } else {
          nextParams.delete('search');
        }
        nextParams.set('page', '1');
        setSearchParams(nextParams);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync searchInput when URL changes
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Construct API query string
  const queryParams = new URLSearchParams();
  if (categoryParam && categoryParam !== 'all') queryParams.set('category', categoryParam);
  if (searchParam) queryParams.set('search', searchParam);
  if (sortParam) queryParams.set('sort', sortParam);
  if (selectedSize) queryParams.set('size', selectedSize);
  if (selectedFabric) queryParams.set('fabric', selectedFabric);
  if (filterParam === 'new') queryParams.set('newArrival', 'true');
  if (filterParam === 'offers' || searchParams.get('bestseller') === 'true') queryParams.set('bestseller', 'true');
  
  if (selectedPriceRange === 'under-500') {
    queryParams.set('maxPrice', '499');
  } else if (selectedPriceRange === '500-999') {
    queryParams.set('minPrice', '500');
    queryParams.set('maxPrice', '999');
  } else if (selectedPriceRange === 'above-1000') {
    queryParams.set('minPrice', '1000');
  }

  queryParams.set('page', pageParam.toString());
  queryParams.set('limit', '12');

  // Fetch live products
  const { data, isLoading } = useQuery({
    queryKey: ['catalog-products', queryParams.toString()],
    queryFn: () => api.getProducts(queryParams.toString()),
  });

  // Fetch categories for filter sidebar
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const categories = catData?.categories || [];

  const handleCategoryChange = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', e.target.value);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedSize('');
    setSelectedFabric('');
    setSelectedPriceRange('');
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = (product) => {
    const variant = product.variants?.[0] || { size: 'Standard', color: '' };
    addItem({
      productId: product._id,
      variantId: variant._id || `${product._id}-${variant.size}`,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url || '',
      size: variant.size,
      color: variant.color,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
    });
    openCartDrawer();
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const fabrics = ['Cotton', 'Mulmul', 'Alpine', 'Rayon', 'Chanderi'];
  const hasActiveFilters = categoryParam !== 'all' || selectedSize || selectedFabric || selectedPriceRange || searchParam;
  const activeFilterCount = [
    categoryParam !== 'all',
    Boolean(selectedSize),
    Boolean(selectedFabric),
    Boolean(selectedPriceRange),
    Boolean(searchParam),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <SEO
        title={`${categoryParam === 'all' ? 'Shop Handcrafted Kurtis & Nighties' : `${categoryParam.replace('-', ' ')} Collection`} | KurtiKatha (কুর্টিকথা)`}
        description="Explore our collection of authentic pure cotton kurtis, daily wear nighties, and festive sets in sizes S to XXL with Pan-India delivery and COD."
        url={`/shop${categoryParam !== 'all' ? `?category=${categoryParam}` : ''}`}
      />
      
      {/* 1. Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cream-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 capitalize">
            {categoryParam === 'all' ? 'All Handcrafted Kurtis & Sets' : `${categoryParam.replace('-', ' ')}`}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {total} pieces in breathable, authentic Indian fabrics
          </p>
        </div>

        {/* Search within collection */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search in collection..."
            className="w-full pl-8 pr-7 py-2 text-xs rounded-full border border-cream-300/80 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal-900"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sleek Controls Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 py-1">
          
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-cream-300 text-xs font-semibold text-charcoal-900 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                categoryParam === 'all'
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white border border-cream-200 text-gray-600 hover:text-charcoal-900 hover:border-cream-300'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categoryParam === cat.slug
                    ? 'bg-charcoal-900 text-white'
                    : 'bg-white border border-cream-200 text-gray-600 hover:text-charcoal-900 hover:border-cream-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-gray-400 hidden sm:inline">Sort:</span>
            <select
              value={sortParam}
              onChange={handleSortChange}
              className="px-3 py-1.5 rounded-xl bg-white border border-cream-300 text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-1.5 focus:ring-brand-500 shadow-2xs"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-gray-400 font-medium">Filtered by:</span>
            {categoryParam !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-charcoal-900 text-[11px] font-medium border border-cream-200">
                {categoryParam}
                <X className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black" onClick={() => handleCategoryChange('all')} />
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-charcoal-900 text-[11px] font-medium border border-cream-200">
                Size: {selectedSize}
                <X className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black" onClick={() => setSelectedSize('')} />
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-charcoal-900 text-[11px] font-medium border border-cream-200">
                {selectedFabric}
                <X className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black" onClick={() => setSelectedFabric('')} />
              </span>
            )}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 text-charcoal-900 text-[11px] font-medium border border-cream-200">
                {selectedPriceRange}
                <X className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black" onClick={() => setSelectedPriceRange('')} />
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-medium text-brand-600 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Catalog Layout (Desktop Sidebar + Grid) */}
      <div className="flex gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-6 pt-1">
          
          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Categories</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  categoryParam === 'all'
                    ? 'font-bold text-brand-600 bg-brand-50'
                    : 'text-gray-600 hover:text-charcoal-900 hover:bg-cream-100'
                }`}
              >
                All Products ({total})
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => handleCategoryChange(c.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    categoryParam === c.slug
                      ? 'font-bold text-brand-600 bg-brand-50'
                      : 'text-gray-600 hover:text-charcoal-900 hover:bg-cream-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2.5 pt-4 border-t border-cream-200/80">
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Sizes</h3>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSize === s
                      ? 'bg-charcoal-900 text-white border-charcoal-900 font-bold'
                      : 'border-cream-300 text-gray-600 hover:border-gray-400 bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Fabrics */}
          <div className="space-y-2 pt-4 border-t border-cream-200/80">
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Fabrics</h3>
            <div className="space-y-1">
              {fabrics.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFabric(selectedFabric === f ? '' : f)}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedFabric === f
                      ? 'font-bold text-brand-600 bg-brand-50'
                      : 'text-gray-600 hover:text-charcoal-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-cream-200/80">
            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Price</h3>
            <div className="space-y-1 text-xs">
              {[
                { label: 'All Prices', val: '' },
                { label: 'Under ₹500', val: 'under-500' },
                { label: '₹500 - ₹999', val: '500-999' },
                { label: 'Above ₹1,000', val: 'above-1000' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setSelectedPriceRange(p.val)}
                  className={`w-full text-left px-2.5 py-1 rounded-lg transition-colors ${
                    selectedPriceRange === p.val
                      ? 'font-bold text-brand-600 bg-brand-50'
                      : 'text-gray-600 hover:text-charcoal-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-3/4 rounded-2xl bg-cream-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200/80 shadow-2xs space-y-4">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-charcoal-900">No products match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try clearing some filters or searching with different keywords.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2 rounded-full bg-charcoal-900 text-white font-medium text-xs hover:bg-black transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
                {products.map((prod) => {
                  const discount = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
                  return (
                    <div
                      key={prod._id}
                      className="group bg-white rounded-2xl border border-cream-200/70 overflow-hidden hover:shadow-card transition-all flex flex-col"
                    >
                      <Link to={`/product/${prod.slug}`} className="relative aspect-3/4 overflow-hidden bg-cream-100 block">
                        <img
                          src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          loading="lazy"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-white/95 text-charcoal-900 font-bold text-[9px] shadow-2xs">
                            {discount}% OFF
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickAdd(prod);
                          }}
                          className="absolute bottom-2 inset-x-2 py-2 px-3 bg-white/95 backdrop-blur-sm rounded-xl font-bold text-xs text-charcoal-900 hover:bg-brand-500 hover:text-white transition-all shadow-2xs flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add</span>
                        </button>
                      </Link>

                      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            {prod.fabric}
                          </p>
                          <Link to={`/product/${prod.slug}`}>
                            <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-1 mt-0.5 group-hover:text-brand-600 transition-colors">
                              {prod.title}
                            </h3>
                          </Link>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-cream-100 flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-charcoal-900">₹{prod.price}</span>
                            {prod.mrp > prod.price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{prod.mrp}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{prod.rating?.average || 4.8}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4. Pagination */}
              {totalPages > 1 && (
                <div className="pt-8 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={pageParam <= 1}
                    onClick={() => handlePageChange(pageParam - 1)}
                    className="p-2 rounded-lg border border-cream-300 bg-white disabled:opacity-30 hover:bg-cream-100 text-charcoal-900 text-xs"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          pageParam === p
                            ? 'bg-charcoal-900 text-white'
                            : 'bg-white border border-cream-200 text-charcoal-900 hover:bg-cream-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={pageParam >= totalPages}
                    onClick={() => handlePageChange(pageParam + 1)}
                    className="p-2 rounded-lg border border-cream-300 bg-white disabled:opacity-30 hover:bg-cream-100 text-charcoal-900 text-xs"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 5. Sleek Mobile Filter Side Panel / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter Products">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" 
            onClick={() => setMobileFilterOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-up">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-cream-200/80 flex items-center justify-between bg-cream-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-charcoal-900">Filter Products</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-900 hover:bg-cream-200/60"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              
              {/* Category */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    className={`p-2 rounded-xl text-xs font-medium capitalize text-left transition-colors ${
                      categoryParam === 'all' ? 'bg-charcoal-900 text-white font-bold' : 'bg-cream-50 text-charcoal-900 hover:bg-cream-100'
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => handleCategoryChange(c.slug)}
                      className={`p-2 rounded-xl text-xs font-medium capitalize text-left transition-colors truncate ${
                        categoryParam === c.slug ? 'bg-charcoal-900 text-white font-bold' : 'bg-cream-50 text-charcoal-900 hover:bg-cream-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2 pt-3 border-t border-cream-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Size</span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedSize === s ? 'bg-charcoal-900 text-white border-charcoal-900 font-bold' : 'border-cream-300 text-charcoal-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div className="space-y-2 pt-3 border-t border-cream-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Fabric</span>
                <div className="flex flex-wrap gap-1.5">
                  {fabrics.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFabric(selectedFabric === f ? '' : f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedFabric === f ? 'bg-charcoal-900 text-white border-charcoal-900 font-bold' : 'border-cream-300 text-charcoal-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-3 border-t border-cream-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Price Range</span>
                <div className="space-y-1">
                  {[
                    { label: 'All Prices', val: '' },
                    { label: 'Under ₹500', val: 'under-500' },
                    { label: '₹500 - ₹999', val: '500-999' },
                    { label: 'Above ₹1,000', val: 'above-1000' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSelectedPriceRange(item.val)}
                      className={`w-full text-left p-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedPriceRange === item.val ? 'bg-brand-50 text-brand-600 font-bold' : 'hover:bg-cream-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Pinned Bottom Actions */}
            <div className="p-4 border-t border-cream-200/80 bg-cream-50/50 flex gap-2.5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-4 bg-white border border-cream-300 text-charcoal-900 font-semibold rounded-xl text-xs hover:bg-cream-100 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                Apply Filters ({total})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
