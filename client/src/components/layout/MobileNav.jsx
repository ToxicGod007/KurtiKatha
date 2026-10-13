import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';

export default function MobileNav() {
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const { openCartDrawer } = useUIStore();

  const navItems = [
    {
      name: 'Home',
      to: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Shop',
      to: '/shop',
      icon: Grid,
    },
    {
      name: 'Wishlist',
      to: '/account/wishlist',
      icon: Heart,
    },
    {
      name: 'Cart',
      isCart: true,
      icon: ShoppingBag,
      badge: totalCartCount,
    },
    {
      name: 'Account',
      to: '/account',
      icon: User,
    },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 shadow-elevated pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={openCartDrawer}
                className="touch-target flex flex-col items-center justify-center gap-1 text-charcoal-900 hover:text-brand-500 relative transition-colors focus:outline-none"
                aria-label={`Shopping Cart with ${totalCartCount} items`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-brand-500" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-brand-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-tight text-brand-500">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `touch-target flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-brand-500 font-bold'
                    : 'text-gray-500 hover:text-brand-500 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-500' : ''}`} />
                  <span className={`text-[10px] tracking-tight ${isActive ? 'text-brand-500' : 'text-gray-500'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
