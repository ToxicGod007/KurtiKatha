import React from 'react';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function Account() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-charcoal-900">My Account</h1>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-500 flex items-center justify-center text-brand-500 font-bold text-2xl">
            {user?.name ? user.name[0].toUpperCase() : 'G'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">{user?.name || 'Guest Shopper'}</h2>
            <p className="text-xs text-gray-500">{user?.phone || '+91 86974 49885'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-cream-200">
          <Link to="/account/orders" className="p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 border border-cream-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-brand-500" />
            <span className="text-sm font-bold text-charcoal-900">My Orders</span>
          </Link>
          <Link to="/account/wishlist" className="p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 border border-cream-200 flex items-center gap-3">
            <Heart className="w-5 h-5 text-brand-500" />
            <span className="text-sm font-bold text-charcoal-900">My Wishlist</span>
          </Link>
          <Link to="/account/addresses" className="p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 border border-cream-200 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-brand-500" />
            <span className="text-sm font-bold text-charcoal-900">Saved Addresses</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
