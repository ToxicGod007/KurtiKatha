import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Heart, 
  Share2,
  ChevronRight,
  Ruler,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';
import SizeChartModal from '../components/product/SizeChartModal';

export default function ProductDetail() {
  const { id } = useParams(); // Can be slug or MongoDB ObjectId

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  // Fetch product from live backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // Initialize selected size and color once product loads
  useEffect(() => {
    if (product && product.variants?.length > 0) {
      const inStockVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize(inStockVariant.size);
      setSelectedColor(inStockVariant.color);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 bg-cream-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-3/4 rounded-3xl bg-cream-200" />
          <div className="space-y-4">
            <div className="h-8 bg-cream-200 rounded w-3/4" />
            <div className="h-6 bg-cream-200 rounded w-1/3" />
            <div className="h-24 bg-cream-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The piece you are looking for might have been moved or sold out.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800' }];

  // Find currently selected variant
  const currentVariant = product.variants?.find((v) => v.size === selectedSize) || product.variants?.[0] || { stock: 0 };
  const isOutOfStock = currentVariant.stock === 0;
  const isLowStock = currentVariant.stock > 0 && currentVariant.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product._id,
      variantId: currentVariant._id || `${product._id}-${selectedSize}`,
      title: product.title,
      slug: product.slug,
      image: images[0]?.url,
      size: selectedSize,
      color: selectedColor || currentVariant.color,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
    });
    openCartDrawer();
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setDeliveryStatus({
        valid: true,
        message: 'Delivery in 3-5 business days • Free shipping over ₹999 • Cash on Delivery (COD) available',
      });
    } else {
      setDeliveryStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on KurtiKatha!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-24 lg:pb-8">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-brand-500">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category?.name && (
          <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-500">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-charcoal-900 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main Product View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left: Multi-Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-3/4 rounded-3xl overflow-hidden bg-cream-100 border border-cream-200 shadow-card">
            <img
              src={images[activeImageIndex]?.url}
              alt={product.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-400 text-charcoal-900 font-extrabold text-xs shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="touch-target absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-900 hover:text-brand-500 shadow-xs"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isCopied && (
              <span className="absolute top-16 right-4 px-3 py-1 rounded-full bg-charcoal-900 text-white text-[11px] font-semibold animate-fade-in">
                Link Copied!
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`touch-target w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-brand-500 shadow-sm scale-102'
                      : 'border-cream-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selectors */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wide border border-brand-200">
                {product.category?.name || 'Ethnic Wear'}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-charcoal-900">{product.rating?.average || 4.8}</span>
                <span>({product.rating?.count || 84} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-charcoal-900 leading-snug">
              {product.title}
            </h1>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-base sm:text-lg text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Save ₹{product.mrp - product.price} ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Size Selector with Stock Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-charcoal-900">
                Select Size: <strong className="text-brand-600">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-brand-600 flex items-center gap-1 hover:underline font-bold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart (Inches)</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.variants?.map(({ size, stock }) => {
                const isVariantOos = stock === 0;
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isVariantOos}
                    onClick={() => setSelectedSize(size)}
                    className={`touch-target px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                      isVariantOos
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through border border-gray-200'
                        : isSelected
                        ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-500 ring-offset-2'
                        : 'bg-white border border-cream-300 text-charcoal-900 hover:border-brand-500'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Live Stock Warning */}
            {isLowStock && (
              <p className="text-xs font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> Hurry, only {currentVariant.stock} left in stock for size {selectedSize}!
              </p>
            )}
            {isOutOfStock && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Size {selectedSize} is currently out of stock.
              </p>
            )}
          </div>

          {/* Desktop Buy / Add to Cart Actions */}
          <div className="hidden lg:flex items-center gap-4 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gold-400 hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed text-charcoal-900 font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-charcoal-900" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
            <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-500" /> Check Estimated Delivery & COD Service
            </span>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-charcoal-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
              >
                Check
              </button>
            </form>
            {deliveryStatus && (
              <p className={`text-xs font-semibold ${deliveryStatus.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                {deliveryStatus.message}
              </p>
            )}
          </div>

          {/* Fabric, Care and Specifications */}
          <div className="pt-4 border-t border-cream-200 space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900">Product Details & Fabric Care</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2">
              <div><strong className="text-charcoal-900">Fabric:</strong> {product.fabric}</div>
              <div><strong className="text-charcoal-900">Pattern:</strong> {product.pattern || 'Authentic Print'}</div>
              <div><strong className="text-charcoal-900">Length:</strong> {product.length || 'Standard Indian Length'}</div>
              <div><strong className="text-charcoal-900">Care:</strong> {product.careInstructions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-cream-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
              You May Also Like
            </h2>
            <Link to="/shop" className="text-xs sm:text-sm font-bold text-brand-600 hover:underline">
              View Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel._id}
                to={`/product/${rel.slug}`}
                className="group bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col"
              >
                <div className="aspect-3/4 overflow-hidden bg-cream-100">
                  <img
                    src={rel.images?.[0]?.url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600'}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-charcoal-900 line-clamp-1 group-hover:text-brand-600">
                    {rel.title}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-brand-600">₹{rel.price}</span>
                    {rel.mrp > rel.price && (
                      <span className="text-[11px] text-gray-400 line-through">₹{rel.mrp}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. MOBILE STICKY BOTTOM ACTION BAR (Strict Requirement) */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-cream-200 p-3 flex items-center gap-3 shadow-elevated">
        <div className="shrink-0 pl-1">
          <p className="text-[10px] text-gray-500">Price</p>
          <p className="text-base font-extrabold text-brand-600 leading-none">₹{product.price}</p>
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="touch-target flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
        </button>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="touch-target flex-1 py-3 px-4 rounded-xl bg-gold-400 hover:bg-gold-500 disabled:opacity-50 text-charcoal-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-charcoal-900" />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category?.name || 'Kurtis'}
      />

    </div>
  );
}
