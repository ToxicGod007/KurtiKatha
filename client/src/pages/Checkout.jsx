import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  Banknote, 
  Tag, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Zap
} from 'lucide-react';
import { api } from '../api/client';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart, getSubtotal } = useCartStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    pincode: '',
    addressLine: '',
    locality: '',
    city: 'Kolkata',
    state: 'West Bengal',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Fetch settings to check if COD is enabled and get shipping thresholds
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const settings = settingsData?.settings || {
    shippingFee: 69,
    freeShippingThreshold: 999,
    codEnabled: true,
  };

  // Populate address if user has saved address
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setFormData((prev) => ({
        ...prev,
        name: def.name || prev.name,
        phone: def.phone || prev.phone,
        pincode: def.pincode || prev.pincode,
        addressLine: def.addressLine || prev.addressLine,
        locality: def.locality || prev.locality,
        city: def.city || prev.city,
        state: def.state || prev.state,
      }));
    }
  }, [user]);

  // Calculations
  const subtotal = getSubtotal();
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const shippingFee = taxableAmount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const grandTotal = taxableAmount + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Simple postal logic helper for common West Bengal & Metro pincodes
    if (name === 'pincode' && value.length === 6) {
      if (value.startsWith('700') || value.startsWith('711') || value.startsWith('712')) {
        setFormData((prev) => ({ ...prev, city: 'Kolkata', state: 'West Bengal' }));
      } else if (value.startsWith('110')) {
        setFormData((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
      } else if (value.startsWith('400')) {
        setFormData((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
      } else if (value.startsWith('560')) {
        setFormData((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
      }
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (items.length === 0) {
      setCheckoutError('Your bag is empty.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.pincode || !formData.addressLine) {
      setCheckoutError('Please fill in all mandatory delivery address fields.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setCheckoutError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send checkout request to server
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          size: i.size,
          quantity: i.quantity,
        })),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          pincode: formData.pincode,
          addressLine: formData.addressLine,
          locality: formData.locality,
          city: formData.city,
          state: formData.state,
        },
        guestInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        couponCode: appliedCoupon?.code,
        paymentMethod,
      };

      const checkoutRes = await api.checkoutOrder(payload);

      // 2. Handle Cash on Delivery flow
      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${checkoutRes.orderNumber}`);
        return;
      }

      // 3. Handle Razorpay Checkout Modal
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: checkoutRes.keyId,
        amount: checkoutRes.amount,
        currency: checkoutRes.currency,
        name: 'KurtiKatha (কুর্টিকথা)',
        description: `Order #${checkoutRes.orderNumber}`,
        image: '/logo.svg',
        order_id: checkoutRes.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
          method: 'upi', // Pre-selects UPI tab by default for 1-tap checkout
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI (PhonePe, Google Pay, Paytm, QR)',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent', 'qr'],
                  },
                ],
              },
              cards: {
                name: 'Credit / Debit Cards & NetBanking',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.cards'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: '#D62828',
        },
        notes: {
          orderNumber: checkoutRes.orderNumber,
          customerPhone: formData.phone,
          preferred_mode: 'upi',
        },
        handler: async function (response) {
          try {
            // Verify payment signature on server
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              clearCart();
              navigate(`/order-success/${verifyRes.orderNumber}`);
            }
          } catch (verifyErr) {
            setCheckoutError(`Payment verification error: ${verifyErr.message}`);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setCheckoutError('Payment window was closed. You can retry paying anytime.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setIsSubmitting(false);
        setCheckoutError(`Payment failed: ${response.error.description || 'Unknown reason'}. Please try another card or UPI.`);
      });

      razorpayInstance.open();
    } catch (err) {
      setCheckoutError(err.message || 'Failed to initialize order checkout.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 max-w-xl mx-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center text-brand-500 mx-auto">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="text-xl font-bold text-charcoal-900">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500">
          Add kurtis or nighties to proceed with checkout.
        </p>
        <Link to="/shop" className="inline-block px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/shop" className="p-2 rounded-full hover:bg-cream-100 text-charcoal-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">Checkout & Payment</h1>
          <p className="text-xs text-gray-500">Complete your address to proceed with secure payment</p>
        </div>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{checkoutError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address & Payment Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-cream-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-100 pb-3">
              <Truck className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-bold text-charcoal-900">Shipping Address (India)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya Banerjee"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Mobile Number (+91) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Email (for order invoice & updates)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">6-Digit PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 700001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Locality / Landmark</label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  placeholder="Near Park / Landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-900 mb-1">Flat / House No., Street Address *</label>
                <input
                  type="text"
                  name="addressLine"
                  required
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  placeholder="Building, street and area address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-cream-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-100 pb-3">
              <Lock className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-bold text-charcoal-900">Choose Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Razorpay UPI & Online Payment (Prepaid) */}
              <label 
                className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-brand-500 bg-brand-50/40 shadow-xs ring-1 ring-brand-500/20'
                    : 'border-cream-200 hover:border-cream-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-brand-500 focus:ring-brand-500 shrink-0"
                />
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-charcoal-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-brand-500" />
                      <span>UPI & Online Payment (Razorpay)</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ⚡ RECOMMENDED / FASTEST
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Pay instantly via Google Pay, PhonePe, Paytm, dynamic UPI QR, or debit/credit cards.
                  </p>

                  {/* Brand Badges: Google Pay, PhonePe, Paytm, BHIM UPI, Cards */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {/* Google Pay */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-cream-200 text-charcoal-800 text-[11px] font-bold shadow-2xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                      </svg>
                      <span>Google Pay</span>
                    </span>

                    {/* PhonePe */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5f259f]/10 border border-[#5f259f]/20 text-[#5f259f] text-[11px] font-bold shadow-2xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[9px] font-black leading-none">पे</span>
                      <span>PhonePe</span>
                    </span>

                    {/* Paytm */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00b9f5]/10 border border-[#00b9f5]/25 text-[#002e6e] text-[11px] font-bold shadow-2xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00b9f5] text-white flex items-center justify-center text-[9px] font-black leading-none">P</span>
                      <span>Paytm</span>
                    </span>

                    {/* Any UPI / QR */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Scan QR / UPI ID</span>
                    </span>

                    {/* Cards */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 border border-cream-200 text-gray-600 text-[11px] font-medium">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      <span>Cards & NetBanking</span>
                    </span>
                  </div>

                  {/* Informational Callout when selected */}
                  {paymentMethod === 'razorpay' && (
                    <div className="p-3 rounded-xl bg-white border border-brand-200/80 text-xs text-charcoal-800 space-y-1 animate-fade-in mt-2">
                      <div className="flex items-center gap-1.5 font-bold text-brand-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>Instant 1-Tap UPI Enabled</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-normal">
                        On mobile, clicking Pay will open PhonePe or Google Pay directly. On desktop, scan the dynamic QR code on screen.
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Cash on Delivery (COD) */}
              {settings.codEnabled && (
                <label 
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                      : 'border-cream-200 hover:border-cream-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-brand-500 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal-900 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-brand-500" />
                      <span>Cash on Delivery (COD)</span>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay cash or scan courier QR upon arrival at your doorstep.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-cream-200 shadow-card space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-charcoal-900 border-b border-cream-100 pb-3 flex items-center justify-between">
              <span>Bag Summary ({items.length} items)</span>
              <span className="text-xs text-brand-600 font-semibold">{paymentMethod.toUpperCase()}</span>
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId || item.size}`} className="flex gap-3 text-xs">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200'}
                    alt={item.title}
                    className="w-14 h-16 object-cover rounded-xl bg-cream-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-charcoal-900 line-clamp-1">{item.title}</h4>
                      <p className="text-gray-400 text-[11px]">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-brand-600">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-cream-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Coupon '{appliedCoupon.code}' applied (-₹{appliedCoupon.discountAmount})</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon Code (e.g. FESTIVE10)"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-cream-300 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode}
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-charcoal-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl hover:bg-black transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-cream-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-cream-200 flex justify-between text-sm font-extrabold text-charcoal-900">
                <span>Total Amount to Pay</span>
                <span className="text-base text-brand-600">₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processing Order...'
                  : paymentMethod === 'cod'
                  ? `Confirm COD Order • ₹${grandTotal}`
                  : `Pay with UPI / Cards • ₹${grandTotal}`}
              </span>
            </button>

            <div className="flex flex-col items-center justify-center gap-1 text-[11px] text-gray-400 text-center pt-1">
              <div className="flex items-center gap-1.5 font-medium text-charcoal-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Secure Checkout via Razorpay</span>
              </div>
              <span className="text-[10px] text-gray-400">
                Supports PhonePe, Google Pay, Paytm, BHIM, UPI QR, Cards & NetBanking
              </span>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
}
