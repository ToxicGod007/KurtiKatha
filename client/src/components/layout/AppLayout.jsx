import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import WhatsAppButton from '../common/WhatsAppButton';
import CartDrawer from '../cart/CartDrawer';
import BackendWarmup from '../common/BackendWarmup';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-charcoal-900 selection:bg-brand-500 selection:text-white">
      {/* Cold start wake-up banner for Render */}
      <BackendWarmup />

      {/* 1. Global Minimalist Header */}
      <Header />

      {/* 2. Page Content Viewport with generous mobile bottom clearance */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 lg:pb-8">
        <Outlet />
      </main>

      {/* 3. Global Footer */}
      <Footer />

      {/* 4. Mobile Bottom Navigation (screens < lg) */}
      <MobileNav />

      {/* 5. Minimalist WhatsApp Support Button */}
      <WhatsAppButton />

      {/* 6. Slide-in Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
