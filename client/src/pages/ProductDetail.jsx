import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Ruler
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Crimson Red');
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const product = {
    id: id || 'sample-pdp-1',
    title: 'Kolkata Kantha Floral Pure Cotton Straight Kurti',
    category: 'Kurtis',
    mrp: 1499,
    price: 799,
    fabric: '100% Breathable Cotton',
    pattern: 'Traditional Kantha Hand Embroidery',
    length: 'Calf Length (44 inches)',
    sleeve: '3/4 Sleeves',
    rating: 4.8,
    reviewsCount: 168,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 4 },
      { size: 'XXL', stock: 0 },
    ],
    colors: ['Crimson Red', 'Indigo Blue', 'Turmeric Gold'],
  };

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor}`,
      title: product.title,
      slug: product.id,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
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
        message: 'Delivery available in 3-5 days • COD Available',
      });
    } else {
      setDeliveryStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian pincode',
      });
    }
  };

  return (
    <div className="space-y-10 pb-20 lg:pb-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-brand-500">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-900 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main Product View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-3/4 rounded-3xl overflow-hidden bg-cream-100 border border-cream-200 shadow-card">
            <img
              src={product.images[activeImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold-400 text-charcoal-900 font-extrabold text-xs shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`touch-target w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-brand-500 shadow-sm scale-102' : 'border-cream-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wide border border-brand-200">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-charcoal-900">{product.rating}</span>
                <span>({product.reviewsCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-charcoal-900 leading-snug">
              {product.title}
            </h1>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">₹{product.price}</span>
              <span className="text-base sm:text-lg text-gray-400 line-through">₹{product.mrp}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                Save ₹{product.mrp - product.price}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-charcoal-900">Select Size:</span>
              <button type="button" className="text-brand-600 flex items-center gap-1 hover:underline">
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Chart (Inches)</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map(({ size, stock }) => {
                const isOutOfStock = stock === 0;
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(size)}
                    className={`touch-target px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                      isOutOfStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
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
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-charcoal-900">Color: {selectedColor}</span>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedColor === color
                      ? 'border-brand-500 bg-brand-50 text-brand-600 font-bold'
                      : 'border-cream-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Buy / Add to Cart Actions */}
          <div className="hidden lg:flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Bag</span>
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gold-400 hover:bg-gold-500 text-charcoal-900 font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-charcoal-900" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
            <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-500" /> Check Estimated Delivery & COD
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

          {/* Fabric & Product Specifications */}
          <div className="pt-4 border-t border-cream-200 space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900">Product Highlights</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><strong className="text-charcoal-900">Fabric:</strong> {product.fabric}</div>
              <div><strong className="text-charcoal-900">Work:</strong> {product.pattern}</div>
              <div><strong className="text-charcoal-900">Length:</strong> {product.length}</div>
              <div><strong className="text-charcoal-900">Sleeve:</strong> {product.sleeve}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE STICKY BOTTOM ACTION BAR (Strict Requirement) */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-cream-200 p-3 flex items-center gap-3 shadow-elevated">
        <div className="shrink-0 pl-1">
          <p className="text-[10px] text-gray-500">Price</p>
          <p className="text-base font-extrabold text-brand-600 leading-none">₹{product.price}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="touch-target flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Bag</span>
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className="touch-target flex-1 py-3 px-4 rounded-xl bg-gold-400 hover:bg-gold-500 text-charcoal-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-charcoal-900" />
          <span>Buy Now</span>
        </button>
      </div>

    </div>
  );
}

