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
    }, 400);
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

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-cream-100 rounded-3xl p-6 sm:p-8 border border-cream-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 capitalize">
            {categoryParam === 'all' ? 'All Kurtis, Nighties & Sets' : `${categoryParam.replace('-', ' ')} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Showing {total} handcrafted pieces in breathable, authentic Indian fabrics
          </p>
        </div>

        {/* Search inside catalog */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search within collection..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls & Active Filters Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 py-2 border-b border-cream-200">
          
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="touch-target lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-cream-300 text-xs font-bold text-charcoal-900 shadow-2xs"
          >
            <Filter className="w-4 h-4 text-brand-500" />
            <span>Filters {hasActiveFilters && '• Active'}</span>
          </button>

          {/* Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                categoryParam === 'all'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-white border border-cream-300 text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  categoryParam === cat.slug
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-white border border-cream-300 text-charcoal-900 hover:bg-cream-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:inline" />
            <select
              value={sortParam}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
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
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-gray-400">Active Filters:</span>
            {categoryParam !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-200">
                Category: {categoryParam}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryChange('all')} />
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-200">
                Size: {selectedSize}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('')} />
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-200">
                Fabric: {selectedFabric}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFabric('')} />
              </span>
            )}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium border border-brand-200">
                Price: {selectedPriceRange}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPriceRange('')} />
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-gray-500 hover:text-brand-500 underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Catalog Layout (Desktop Sidebar + Grid) */}
      <div className="flex gap-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <span className="text-sm font-bold text-charcoal-900">Filters</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Price Range</span>
              <div className="space-y-1.5">
                {[
                  { label: 'All Prices', val: '' },
                  { label: 'Under ₹500', val: 'under-500' },
                  { label: '₹500 - ₹999', val: '500-999' },
                  { label: 'Above ₹1000', val: 'above-1000' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedPriceRange(item.val)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedPriceRange === item.val
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-gray-600 hover:bg-cream-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2.5 pt-4 border-t border-cream-100">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Size</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === s
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-cream-300 text-charcoal-900 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Filter */}
            <div className="space-y-2.5 pt-4 border-t border-cream-100">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Fabric</span>
              <div className="space-y-1.5">
                {fabrics.map((fab) => (
                  <button
                    key={fab}
                    type="button"
                    onClick={() => setSelectedFabric(selectedFabric === fab ? '' : fab)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedFabric === fab
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-gray-600 hover:bg-cream-50'
                    }`}
                  >
                    {fab}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-3/4 rounded-2xl bg-cream-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 shadow-card space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-charcoal-900">No items match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try adjusting your search terms, removing filters, or explore our full collection.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((prod) => {
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
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-gold-400 text-charcoal-900 font-extrabold text-[10px]">
                            {discount}% OFF
                          </span>
                        )}
                        {prod.bestseller && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-brand-500 text-white font-bold text-[10px]">
                            Bestseller
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
                          <p className="text-[11px] font-medium text-brand-600 uppercase tracking-wider">
                            {prod.fabric}
                          </p>
                          <Link to={`/product/${prod.slug}`}>
                            <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug mt-0.5 group-hover:text-brand-600 transition-colors">
                              {prod.title}
                            </h3>
                          </Link>
                        </div>

                        <div className="mt-3 pt-2 border-t border-cream-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-brand-600">₹{prod.price}</span>
                            {prod.mrp > prod.price && (
                              <span className="text-xs text-gray-400 line-through">₹{prod.mrp}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{prod.rating?.average || 4.8}</span>
                            <span>({prod.rating?.count || 45})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4. Pagination */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={pageParam <= 1}
                    onClick={() => handlePageChange(pageParam - 1)}
                    className="p-2.5 rounded-xl border border-cream-300 bg-white disabled:opacity-40 hover:bg-cream-100 text-charcoal-900"
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
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          pageParam === p
                            ? 'bg-brand-500 text-white shadow-xs'
                            : 'bg-white border border-cream-300 text-charcoal-900 hover:bg-cream-100'
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
                    className="p-2.5 rounded-xl border border-cream-300 bg-white disabled:opacity-40 hover:bg-cream-100 text-charcoal-900"
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

      {/* 5. Mobile Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileFilterOpen(false)} 
          />
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-elevated z-50 p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="text-base font-bold text-charcoal-900">Filters</h3>
              <button 
                type="button" 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-charcoal-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-900 uppercase">Category</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className={`p-2.5 rounded-xl text-xs font-semibold capitalize ${
                    categoryParam === 'all' ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-cream-50'
                  }`}
                >
                  All Products
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => handleCategoryChange(c.slug)}
                    className={`p-2.5 rounded-xl text-xs font-semibold capitalize ${
                      categoryParam === c.slug ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-cream-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-900 uppercase">Size</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      selectedSize === s ? 'bg-brand-500 text-white border-brand-500' : 'border-cream-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-900 uppercase">Price</span>
              <div className="space-y-1">
                {[
                  { label: 'All Prices', val: '' },
                  { label: 'Under ₹500', val: 'under-500' },
                  { label: '₹500 - ₹999', val: '500-999' },
                  { label: 'Above ₹1000', val: 'above-1000' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedPriceRange(item.val)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium ${
                      selectedPriceRange === item.val ? 'bg-brand-50 text-brand-600 font-bold' : 'bg-cream-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 bg-cream-100 text-charcoal-900 font-bold rounded-xl text-xs"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-md text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
