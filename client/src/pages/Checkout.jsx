import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Checkout() {
  const { items, getGrandTotal, getSubtotal, getShippingFee } = useCartStore();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/shop" className="p-2 rounded-full hover:bg-cream-100 text-charcoal-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-extrabold text-charcoal-900">Checkout</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
        {items.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-base font-semibold text-charcoal-900">Your bag is currently empty.</p>
            <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-sm">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Ready to checkout with <strong>{items.length}</strong> items in your bag. Total: <strong>₹{getGrandTotal()}</strong>.
            </p>
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center gap-3 text-xs text-charcoal-900">
              <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0" />
              <span>Full Razorpay Checkout and COD flow will be wired in Phase 4.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

