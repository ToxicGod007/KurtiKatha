import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Phone, 
  MessageCircle,
  PackageCheck,
  Sparkles,
  LogOut
} from 'lucide-react';
import Logo from '../common/Logo';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

export default function MobileMenuDrawer() {
  const { isMobileMenuOpen, closeMobileMenu, openCartDrawer } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  // Prevent background body scrolling when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  if (!isMobileMenuOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      closeMobileMenu();
    }
  };

  const navCategories = [
    { name: 'All Collection', path: '/shop', subtitle: 'Browse entire catalog' },
    { name: 'Handcrafted Kurtis', path: '/shop?category=kurtis', subtitle: 'Pure cotton daily & office wear' },
    { name: 'Cotton Nighties', path: '/shop?category=nighties', subtitle: 'Breathable, free-fitting comfort' },
    { name: 'Festive Kurti Sets', path: '/shop?category=kurti-sets', subtitle: 'Dupatta & pant pairings' },
    { name: 'New Arrivals', path: '/shop?filter=new', subtitle: 'Fresh boutique drops', isNew: true },
    { name: 'Offers & Deals', path: '/shop?filter=offers', subtitle: 'Special festive pricing', isHighlight: true },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeMobileMenu}
      />

      {/* Slide-in Panel from Left */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-slide-up">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-cream-200/80 flex items-center justify-between bg-cream-50/50">
          <Logo size="sm" />
          <button
            type="button"
            onClick={closeMobileMenu}
            className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal-900 hover:bg-cream-200/60 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside Drawer */}
        <div className="p-4 border-b border-cream-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search kurtis, fabrics, sizes..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300/80 bg-cream-50/60 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-500 placeholder:text-gray-400 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          
          {/* Categories */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1.5">
              Categories
            </span>
            <div className="space-y-0.5">
              {navCategories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cream-100/70 transition-colors group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold tracking-tight ${
                        cat.isHighlight ? 'text-brand-600' : 'text-charcoal-900 group-hover:text-brand-600'
                      }`}>
                        {cat.name}
                      </span>
                      {cat.isNew && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          New
                        </span>
                      )}
                      {cat.isHighlight && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-gold-100 text-charcoal-900 border border-gold-300">
                          Sale
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-normal mt-0.5">
                      {cat.subtitle}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Account Links */}
          <div className="pt-3 border-t border-cream-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1.5">
              Quick Access
            </span>
            <div className="space-y-0.5">
              <Link
                to="/account/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-charcoal-900 hover:bg-cream-100/70 transition-colors"
              >
                <Heart className="w-4 h-4 text-gray-500" />
                <span>My Wishlist</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  openCartDrawer();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-charcoal-900 hover:bg-cream-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-brand-500" />
                  <span>My Shopping Bag</span>
                </div>
                {totalCartCount > 0 && (
                  <span className="px-2 py-0.5 bg-brand-500 text-white rounded-full text-[10px] font-bold">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-charcoal-900 hover:bg-cream-100/70 transition-colors"
              >
                <PackageCheck className="w-4 h-4 text-gray-500" />
                <span>Track My Orders</span>
              </Link>
            </div>
          </div>

          {/* Customer Assistance */}
          <div className="pt-3 border-t border-cream-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1.5">
              Customer Support
            </span>
            <div className="p-3 rounded-2xl bg-cream-50/70 border border-cream-200/60 space-y-2 text-xs">
              <a
                href="https://wa.me/918697449885?text=Hello%20KurtiKatha!%20Need%20assistance%20with%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: +91 86974 49885</span>
              </a>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Mon - Sat, 10 AM to 7 PM IST. Pure cotton sizing & order assistance.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Auth Row */}
        <div className="p-4 border-t border-cream-200/80 bg-cream-50/50">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-charcoal-900 truncate">{user?.name || 'Customer'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
