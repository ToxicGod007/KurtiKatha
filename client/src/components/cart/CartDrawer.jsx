import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Truck, 
  Sparkles 
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
    shippingThreshold,
  } = useCartStore();

  const subtotal = getSubtotal();
  const savings = getSavings();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const progress = getProgressToFreeShipping();
  const remaining = getRemainingForFreeShipping();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-elevated flex flex-col transform transition-transform animate-slide-up">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-charcoal-900">Your Bag ({items.length})</h2>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="touch-target p-2 rounded-full hover:bg-cream-200 text-charcoal-900 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-4 bg-brand-50/80 border-b border-brand-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-brand-700">
                <Truck className="w-4 h-4 text-brand-500" />
                {remaining > 0 ? (
                  <>Add <span className="font-bold text-brand-600">₹{remaining}</span> more for <span className="text-brand-600">FREE delivery</span></>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> You unlocked FREE delivery!
                  </span>
                )}
              </span>
              <span className="text-brand-800 text-[11px] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center text-brand-500">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-charcoal-900">Your bag is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Discover pure cotton kurtis and comfortable nighties crafted for you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={`${item.productId}-${item.variantId || item.size}`}
                  className="flex gap-3.5 p-3 rounded-2xl border border-cream-200 bg-cream-50/50 hover:border-cream-300 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-20 h-24 object-cover rounded-xl bg-cream-100 shrink-0"
                    loading="lazy"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-semibold text-charcoal-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-gray-400 hover:text-brand-500 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {item.size && <span className="px-2 py-0.5 rounded-md bg-white border border-cream-200 font-medium">Size: {item.size}</span>}
                        {item.color && <span className="px-2 py-0.5 rounded-md bg-white border border-cream-200 font-medium">Color: {item.color}</span>}
                      </div>
                    </div>

                    {/* Price and Quantity Adjuster */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-brand-600">₹{item.price}</span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                        )}
                      </div>

                      <div className="flex items-center border border-cream-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="touch-target w-7 h-7 flex items-center justify-center text-charcoal-900 hover:bg-cream-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="touch-target w-7 h-7 flex items-center justify-center text-charcoal-900 hover:bg-cream-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-cream-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Special Discount Savings</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                <div className="pt-2 border-t border-cream-200 flex justify-between text-sm font-bold text-charcoal-900">
                  <span>Estimated Total</span>
                  <span className="text-base text-brand-600">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-gray-400">
                🔒 Safe & encrypted Razorpay payment • Cash on Delivery also available
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

