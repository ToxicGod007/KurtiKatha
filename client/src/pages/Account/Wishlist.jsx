import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-charcoal-900">My Wishlist</h1>
      
      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-charcoal-900">Your wishlist is currently empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Save your favourite cotton kurtis and comfortable nighties here to review and purchase later.
        </p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors">
          Explore Products
        </Link>
      </div>
    </div>
  );
}

