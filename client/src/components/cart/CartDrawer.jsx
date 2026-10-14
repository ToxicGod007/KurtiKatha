import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';

export default function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const navigate = useNavigate();

  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getSavings,
    getShippingFee,
    getGrandTotal,
    getProgressToFreeShipping,
    getRemainingForFreeShipping,
  } = useCartStore();

  const subtotal = getSubtotal();
  const savings = getSavings();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const progress = getProgressToFreeShipping();
  const remaining = getRemainingForFreeShipping();

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  if (!isCartDrawerOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Shopping Cart Drawer"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeCartDrawer}
      />

      {/* Slide-in Panel from Right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-cream-200/80 flex items-center justify-between bg-cream-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <h2 className="text-base font-bold text-charcoal-900 tracking-tight">
                Shopping Bag <span className="text-xs font-normal text-gray-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal-900 hover:bg-cream-200/60 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimalist Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-cream-50/70 border-b border-cream-200/60 text-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                {remaining > 0 ? (
                  <span>Add <strong className="text-charcoal-900 font-semibold">₹{remaining}</strong> for Free Delivery</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Unlocked Free Delivery!</span>
                )}
              </span>
              <span className="font-bold text-charcoal-900">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-7 h-7 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-charcoal-900">Your bag is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Discover breathable cotton kurtis and comfortable nighties.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId || item.size}`}
                  className="flex gap-3.5 py-3 border-b border-cream-100 last:border-b-0 items-start"
                >
                  {/* Clean Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-18 h-22 object-cover rounded-xl bg-cream-100 shrink-0"
                    loading="lazy"
                  />

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-22">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-charcoal-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                        {item.size && <span className="text-gray-600 font-medium">Size {item.size}</span>}
                        {item.size && item.color && <span>•</span>}
                        {item.color && <span>{item.color}</span>}
                      </div>
                    </div>

                    {/* Price and Minimalist Quantity Stepper */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-charcoal-900">₹{item.price}</span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                        )}
                      </div>

                      <div className="flex items-center border border-cream-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-charcoal-900 hover:bg-cream-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-charcoal-900 hover:bg-cream-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Minimalist Drawer Footer */}
          {items.length > 0 && (
            <div className="px-5 py-4 border-t border-cream-200/80 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal-900">₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount Savings</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                <div className="pt-2 border-t border-cream-100 flex justify-between text-sm font-bold text-charcoal-900">
                  <span>Total</span>
                  <span className="text-base text-brand-600">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-3 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.99]"
              >
                <span>Proceed to Checkout • ₹{grandTotal}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Encrypted Razorpay Checkout • Cash on Delivery</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
