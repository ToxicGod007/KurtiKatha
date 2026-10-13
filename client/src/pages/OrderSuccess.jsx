import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Printer, 
  ShoppingBag, 
  ArrowRight, 
  Phone, 
  Clock, 
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { api } from '../api/client';

export default function OrderSuccess() {
  const { orderNumber } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.getOrder(orderNumber),
  });

  const order = data?.order;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-cream-200 mx-auto" />
        <div className="h-6 bg-cream-200 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-cream-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      
      {/* 1. Success Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-card text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-2">
            Dhanyawad! Your Order is Placed
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Order Reference: <strong className="text-charcoal-900 font-mono">{orderNumber}</strong>
          </p>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          We have sent a confirmation email & SMS with your invoice. Our Kolkata artisan workshop has started packaging your order.
        </p>

        {/* Status Timeline */}
        <div className="pt-6 border-t border-cream-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Live Order Progress
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="font-bold text-charcoal-900 text-[11px]">Placed</p>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <p className="font-bold text-brand-600 text-[11px]">Confirmed</p>
            </div>
            <div className="space-y-1.5 opacity-40">
              <div className="w-8 h-8 rounded-full bg-cream-200 text-gray-500 flex items-center justify-center mx-auto">
                <Package className="w-4 h-4" />
              </div>
              <p className="font-medium text-gray-600 text-[11px]">Packed</p>
            </div>
            <div className="space-y-1.5 opacity-40">
              <div className="w-8 h-8 rounded-full bg-cream-200 text-gray-500 flex items-center justify-center mx-auto">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-medium text-gray-600 text-[11px]">Shipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Order Details Breakdown */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <h3 className="text-sm font-bold text-charcoal-900">Items Ordered</h3>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="space-y-3 divide-y divide-cream-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200'}
                    alt={item.title}
                    className="w-14 h-16 object-cover rounded-xl bg-cream-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-charcoal-900 text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-gray-400 text-[11px]">
                      Size: <strong>{item.variant?.size}</strong> • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-charcoal-900 text-sm">₹{item.subtotal}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Shipping address summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-cream-100">
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-charcoal-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Shipping Details</span>
              </h4>
              <p className="text-gray-600">
                <strong>{order.shippingAddress?.name}</strong><br />
                {order.shippingAddress?.addressLine}, {order.shippingAddress?.locality}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 sm:text-right">
              <div className="flex justify-between sm:justify-end gap-6">
                <span>Subtotal:</span>
                <span className="font-semibold text-charcoal-900">₹{order.amounts?.subtotal}</span>
              </div>
              {order.amounts?.discount > 0 && (
                <div className="flex justify-between sm:justify-end gap-6 text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.amounts?.discount}</span>
                </div>
              )}
              <div className="flex justify-between sm:justify-end gap-6">
                <span>Shipping:</span>
                <span>{order.amounts?.shippingFee === 0 ? 'FREE' : `₹${order.amounts?.shippingFee}`}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-sm font-extrabold text-charcoal-900 pt-1 border-t border-cream-100">
                <span>Paid Total:</span>
                <span className="text-brand-600">₹{order.amounts?.total}</span>
              </div>
              <p className="text-[11px] text-gray-400 capitalize">
                Payment: {order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online Prepaid (Razorpay)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Buttons & WhatsApp Assistance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to="/shop"
          className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <a
          href={`https://wa.me/918697449885?text=Hello%20KurtiKatha%2C%20I%20have%20an%20inquiry%20about%20my%20order%20%23${orderNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target w-full sm:w-auto px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Need Help? Chat on WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
