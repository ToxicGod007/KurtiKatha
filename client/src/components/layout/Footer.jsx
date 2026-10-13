import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Clock } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-cream-200 mt-16 pb-24 lg:pb-12 text-charcoal-900 transition-colors">
      {/* 1. Value Proposition Strip */}
      <div className="border-b border-cream-200 bg-cream-50/70">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal-900">Pan-India Delivery</h4>
                <p className="text-xs text-gray-500">Free delivery over ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal-900">100% Pure Fabrics</h4>
                <p className="text-xs text-gray-500">Breathable cotton & rayon</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal-900">Easy Returns</h4>
                <p className="text-xs text-gray-500">7-day hassle-free exchange</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal-900">Direct Support</h4>
                <p className="text-xs text-gray-500">Call / WhatsApp 10am - 9pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              KurtiKatha brings you thoughtfully crafted, everyday ethnic wear and comfortable nighties, celebrating traditional elegance and all-day ease at fair, honest prices.
            </p>
            <div className="pt-2 space-y-2">
              <a 
                href="tel:+918697449885" 
                className="flex items-center gap-2.5 text-sm font-medium text-charcoal-900 hover:text-brand-500 transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span>+91 86974 49885</span>
              </a>
              <a 
                href="mailto:support@kurtikatha.com" 
                className="flex items-center gap-2.5 text-sm font-medium text-charcoal-900 hover:text-brand-500 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>support@kurtikatha.com</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India — 700001</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Shop Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link to="/shop?category=kurtis" className="hover:text-brand-500 transition-colors">Daily Wear Kurtis</Link>
              </li>
              <li>
                <Link to="/shop?category=nighties" className="hover:text-brand-500 transition-colors">Cotton Nighties</Link>
              </li>
              <li>
                <Link to="/shop?category=kurti-sets" className="hover:text-brand-500 transition-colors">Kurti & Pant Sets</Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="hover:text-brand-500 transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/shop?filter=offers" className="text-brand-500 font-semibold hover:underline">Special Offers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-500 transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-brand-500 transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-500 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-500 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-brand-500 transition-colors">Track Your Order</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-500 transition-colors">Our Story & Craft</Link>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-cream-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Methods</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
                <span className="px-2 py-1 bg-cream-100 rounded-md border border-cream-200">Razorpay</span>
                <span className="px-2 py-1 bg-cream-100 rounded-md border border-cream-200">UPI / QR</span>
                <span className="px-2 py-1 bg-cream-100 rounded-md border border-cream-200">Cards</span>
                <span className="px-2 py-1 bg-cream-100 rounded-md border border-cream-200">COD</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} KurtiKatha (কুর্টিকথা). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with love for Indian fashion • Designed for pure comfort
          </p>
        </div>
      </div>
    </footer>
  );
}

