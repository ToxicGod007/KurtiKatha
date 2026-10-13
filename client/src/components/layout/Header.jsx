import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Phone, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Logo from '../common/Logo';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const { openCartDrawer, isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useUIStore();
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const { user, isAuthenticated } = useAuthStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      closeMobileMenu();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Kurtis', path: '/shop?category=kurtis' },
    { name: 'Nighties', path: '/shop?category=nighties' },
    { name: 'Kurti Sets', path: '/shop?category=kurti-sets' },
    { name: 'New Arrivals', path: '/shop?filter=new', badge: 'New' },
    { name: 'Offers & Deals', path: '/shop?filter=offers', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-xs transition-all">
      {/* 1. Announcement Bar */}
      <div className="bg-brand-500 text-white text-xs md:text-sm font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
        <span>Festive Sale: Free Shipping on orders over ₹999 | Cash on Delivery (COD) Available</span>
        <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0 hidden sm:inline" />
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2 sm:gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={openMobileMenu}
              className="touch-target p-2 rounded-lg text-charcoal-900 hover:bg-cream-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 text-brand-500" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pure cotton kurtis, nighties, sets..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-cream-300 bg-cream-50 focus:bg-white text-sm text-charcoal-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button 
                type="submit" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-full transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Contact & Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Store Phone Help (Desktop) */}
            <a 
              href="tel:+918697449885" 
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-cream-200 text-xs font-medium text-charcoal-900 hover:text-brand-500 transition-colors"
              title="Shop Assistance & Order Support"
            >
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              <span>+91 86974 49885</span>
            </a>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden touch-target p-2 rounded-full text-charcoal-900 hover:bg-cream-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/account/wishlist"
              className="touch-target p-2 rounded-full text-charcoal-900 hover:bg-cream-100 hover:text-brand-500 relative transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="touch-target p-2 rounded-full text-charcoal-900 hover:bg-cream-100 hover:text-brand-500 relative transition-colors"
              aria-label={`Shopping Cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Account / Admin Link */}
            <Link
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/account') : '/login'}
              className="touch-target p-2 rounded-full text-charcoal-900 hover:bg-cream-100 hover:text-brand-500 relative transition-colors"
              aria-label="User Account"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              {user?.role === 'admin' && (
                <span className="absolute -bottom-1 -right-1 bg-gold-500 text-[9px] font-bold text-charcoal-900 px-1 rounded-sm uppercase tracking-tighter">
                  Admin
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* 3. Mobile Search Drawer (collapsible) */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3 px-1 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cotton kurtis, nighties, sets..."
                autoFocus
                className="w-full pl-10 pr-16 py-2.5 rounded-full border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* 4. Desktop Category Submenu */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-cream-100 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative py-1 transition-colors ${
                link.highlight 
                  ? 'text-brand-500 font-semibold hover:text-brand-600' 
                  : 'text-charcoal-900 hover:text-brand-500'
              }`}
            >
              {link.name}
              {link.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gold-400 text-charcoal-900">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* 5. Mobile Side Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={closeMobileMenu} 
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-elevated z-50 flex flex-col">
            <div className="p-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
              <Logo size="sm" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="touch-target p-2 rounded-full hover:bg-cream-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-charcoal-900" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Categories</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-charcoal-900 hover:bg-brand-50 hover:text-brand-500 transition-colors"
                >
                  <span>{link.name}</span>
                  <div className="flex items-center gap-1.5">
                    {link.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gold-400 text-charcoal-900">
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}

              <div className="pt-6 border-t border-cream-200 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Shop Assistance</p>
                <a
                  href="tel:+918697449885"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-charcoal-900 hover:text-brand-500"
                >
                  <Phone className="w-4 h-4 text-brand-500" />
                  <span>Call: +91 86974 49885</span>
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-cream-200 bg-cream-50">
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                onClick={closeMobileMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-brand-600 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>{isAuthenticated ? 'My Account' : 'Login / Register'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

