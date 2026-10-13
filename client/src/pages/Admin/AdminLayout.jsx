import React from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../api/client';
import AdminLogin from './AdminLogin';

export default function AdminLayout() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network error on logout
    }
    logout();
    navigate('/admin');
  };

  // If user is not logged in as admin, render the login card
  if (!user || user.role !== 'admin') {
    return <AdminLogin onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const navItems = [
    { label: 'Overview', to: '/admin', end: true, icon: LayoutDashboard },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col lg:flex-row pb-16 lg:pb-0">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-cream-200 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-cream-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold text-[10px] uppercase tracking-wider border border-brand-200">
              Admin
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Operations & Storefront Control</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-cream-100 hover:text-charcoal-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cream-100 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-cream-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span>Customer Storefront</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <div className="pt-2 border-t border-cream-100 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center">
                A
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-charcoal-900 block truncate max-w-[100px]">
                  {user.name || 'Admin'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Store Manager</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <header className="lg:hidden bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-extrabold text-[9px] uppercase border border-brand-200">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-cream-100 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[11px]">Store</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-600"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet context={{ onNavigateTab: (tab) => navigate(`/admin/${tab === 'dashboard' ? '' : tab}`) }} />
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (>= 44px Touch Targets) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 z-40 px-2 py-1 shadow-lg flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-brand-600' : 'text-gray-400 hover:text-charcoal-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-600 stroke-[2.5]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}

