import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import Wishlist from './pages/Account/Wishlist';
import About from './pages/Static/About';
import Contact from './pages/Static/Contact';
import FAQ from './pages/Static/FAQ';
import ShippingPolicy from './pages/Static/ShippingPolicy';
import Terms from './pages/Static/Terms';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminSettings from './pages/Admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Catalog />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success/:orderNumber" element={<OrderSuccess />} />
        <Route path="account" element={<Account />} />
        <Route path="account/wishlist" element={<Wishlist />} />
        <Route path="account/orders" element={<Account />} />
        <Route path="account/addresses" element={<Account />} />
        <Route path="login" element={<Account />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="shipping-policy" element={<ShippingPolicy />} />
        <Route path="returns" element={<ShippingPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy-policy" element={<Terms />} />
      </Route>

      {/* Admin Operations Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

