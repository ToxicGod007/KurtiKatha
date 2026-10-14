import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';

export default function MobileNav() {
  const totalCartCount = useCartStore((state) => state.getTotalCount());
  const { openCartDrawer } = useUIStore();

  const navItems = [
    { name: 'Home', to: '/', icon: Home, exact: true },
    { name: 'Shop', to: '/shop', icon: Grid },
    { name: 'Wishlist', to: '/account/wishlist', icon: Heart },
    { name: 'Bag', isCart: true, icon: ShoppingBag, badge: totalCartCount },
    { name: 'Account', to: '/account', icon: User },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200/80 shadow-soft pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={openCartDrawer}
                className="flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-brand-500 relative transition-colors focus:outline-none"
                aria-label={`Shopping Bag with ${totalCartCount} items`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-charcoal-900" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-brand-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight text-charcoal-900">
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
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive 
                    ? 'text-brand-600 font-bold' 
                    : 'text-gray-400 hover:text-charcoal-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 stroke-[2.2]' : 'text-gray-500 stroke-[1.8]'}`} />
                  <span className="text-[10px] tracking-tight">
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
