import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Logo from '../common/Logo';
import MobileMenuDrawer from './MobileMenuDrawer';
import { useUIStore } from '../../store/useUIStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const { openCartDrawer, openMobileMenu } = useUIStore();
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'All Kurtis', path: '/shop?category=kurtis' },
    { name: 'Daily Nighties', path: '/shop?category=nighties' },
    { name: 'Kurti Sets', path: '/shop?category=kurti-sets' },
    { name: 'New Arrivals', path: '/shop?filter=new', isNew: true },
    { name: 'Offers', path: '/shop?filter=offers', isSale: true },
  ];

  const quickSearchTags = ['Mulmul Cotton', 'A-Line Kurti', 'Nighties with Pockets', 'Festive Sets'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200/70 transition-all">
      {/* 1. Minimal Announcement Bar */}
      <div className="bg-charcoal-900 text-cream-100 text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="text-gold-400 font-bold uppercase tracking-widest text-[9px]">KurtiKatha</span>
        <span className="text-cream-400">•</span>
        <span>Free Delivery on orders above ₹999</span>
        <span className="text-cream-400">•</span>
        <span>Cash on Delivery (COD) Available</span>
      </div>

      {/* 2. Sleek Single-Tier Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Mobile Menu Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={openMobileMenu}
              className="p-2 -ml-2 rounded-xl text-charcoal-900 hover:bg-cream-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-charcoal-900" />
            </button>
          </div>

          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Logo size="sm" />

            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-1 transition-colors hover:text-brand-500 ${
                    link.isSale 
                      ? 'text-brand-600 font-bold' 
                      : 'text-charcoal-900'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.isNew && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 ml-1.5 -translate-y-1" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Action Icons (Minimalist) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-colors ${
                isSearchOpen ? 'bg-cream-100 text-brand-600' : 'text-charcoal-900 hover:bg-cream-100'
              }`}
              aria-label="Toggle Search"
            >
              {isSearchOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Search className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="p-2 rounded-full text-charcoal-900 hover:bg-cream-100 transition-colors hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="p-2 rounded-full text-charcoal-900 hover:bg-cream-100 transition-colors relative"
              aria-label={`Shopping Bag with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal-900" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Account / Admin */}
            <Link
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/account') : '/login'}
              className="p-2 rounded-full text-charcoal-900 hover:bg-cream-100 transition-colors relative"
              aria-label="User Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {user?.role === 'admin' && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-400 text-charcoal-900 text-[8px] font-extrabold px-1 rounded-sm uppercase tracking-tighter">
                  Admin
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* 3. Minimalist Expandable Search Overlay */}
        {isSearchOpen && (
          <div className="py-4 border-t border-cream-100 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by fabric, style, color (e.g. Cotton Kurti, Indigo, Nighty)..."
                className="w-full pl-11 pr-24 py-2.5 rounded-full border border-cream-300 bg-cream-50 focus:bg-white text-xs sm:text-sm text-charcoal-900 placeholder:text-gray-400 focus:outline-none focus:ring-1.5 focus:ring-brand-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-charcoal-900 hover:bg-black text-white text-xs font-semibold rounded-full transition-colors"
              >
                Search
              </button>
            </form>

            <div className="max-w-2xl mx-auto mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] text-gray-500">
              <span className="shrink-0 font-medium">Popular:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    navigate(`/shop?search=${encodeURIComponent(tag)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-900 transition-colors shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. Dedicated Mobile Side Navigation Drawer */}
      <MobileMenuDrawer />
    </header>
  );
}
