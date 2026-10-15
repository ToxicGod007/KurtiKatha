import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  Edit3, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import Logo from '../../components/common/Logo';
import SEO from '../../components/common/SEO';

export default function Account() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  // Active sub-view when logged in: 'orders' | 'addresses' | 'profile'
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Phone Auth State
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine: '',
    locality: '',
    city: '',
    state: 'West Bengal',
    isDefault: true,
  });

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Sync profile edit state with current user
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email?.endsWith('@kurtikatha.customer') ? '' : user.email || '');
    }
  }, [user]);

  // Fetch orders when logged in
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.getMyOrders(),
    enabled: isAuthenticated,
  });

  const orders = ordersData?.orders || [];

  // 1. Send OTP Handler
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanDigits = phoneInput.replace(/\D/g, '');
    const valid10Digits = cleanDigits.length === 12 && cleanDigits.startsWith('91')
      ? cleanDigits.slice(2)
      : cleanDigits.length === 11 && cleanDigits.startsWith('0')
      ? cleanDigits.slice(1)
      : cleanDigits;

    if (!/^[6-9]\d{9}$/.test(valid10Digits)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.sendOtp(valid10Digits);
      if (res.success) {
        setIsNewUser(Boolean(res.isNewUser));
        setStep('otp');
        setTimer(60);
        setSuccessMsg(res.message);
        if (res.debugOtp) {
          // Pre-populate for easy testing in development
          setOtpInput(res.debugOtp);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpInput || otpInput.trim().length < 4) {
      setErrorMsg('Please enter the OTP sent to your mobile.');
      return;
    }

    const cleanDigits = phoneInput.replace(/\D/g, '');
    const valid10Digits = cleanDigits.length === 12 && cleanDigits.startsWith('91')
      ? cleanDigits.slice(2)
      : cleanDigits.length === 11 && cleanDigits.startsWith('0')
      ? cleanDigits.slice(1)
      : cleanDigits;

    try {
      setIsLoading(true);
      const res = await api.verifyOtp({
        phone: valid10Digits,
        otp: otpInput.trim(),
        name: nameInput.trim() || undefined,
      });

      if (res.success && res.user) {
        setUser(res.user);
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        setStep('phone');
        setOtpInput('');
        setPhoneInput('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Update Profile Handler
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await api.updateProfile({
        name: profileName,
        email: profileEmail || undefined,
      });
      if (res.success) {
        setUser(res.user);
        setIsEditingProfile(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Add Address Handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await apiRequest('/auth/address', {
        method: 'PUT',
        body: JSON.stringify(newAddress),
      });
      if (res.success) {
        const updated = await api.getMe();
        if (updated?.user) setUser(updated.user);
        setIsAddingAddress(false);
        setNewAddress({
          name: '',
          phone: '',
          pincode: '',
          addressLine: '',
          locality: '',
          city: '',
          state: 'West Bengal',
          isDefault: false,
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Logout Handler
  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await api.logout().catch(() => {});
      logout();
    }
  };

  // -------------------------------------------------------------
  // VIEW A: If user is NOT authenticated, render Mobile Phone Auth
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
        <SEO
          title="Login or Sign Up with Mobile | KurtiKatha (কুর্টিকথা)"
          description="Login or create your KurtiKatha account using your 10-digit mobile phone number. Instant OTP verification with zero password hassle."
          url="/login"
        />

        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/80 shadow-card space-y-6 animate-fade-in">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <Logo size="md" className="justify-center" />
            <h1 className="text-xl font-extrabold text-charcoal-900 tracking-tight mt-2">
              {step === 'phone' ? 'Login or Sign Up' : 'Verify Phone Number'}
            </h1>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {step === 'phone' 
                ? 'Enter your 10-digit mobile number to receive an instant OTP verification code.' 
                : `We sent a 6-digit verification code to +91 ${phoneInput.replace(/\D/g, '').slice(-10)}.`}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Number Input Form */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-charcoal-900 pointer-events-none border-r border-cream-200 pr-2.5">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    autoFocus
                    className="w-full pl-22 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/60 focus:bg-white text-sm font-semibold tracking-wider text-charcoal-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1.5 focus:ring-brand-500 transition-all shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  10-digit Indian number without 0 or +91
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || phoneInput.length < 10}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Request OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-gray-400 leading-relaxed">
                By continuing, you agree to KurtiKatha's{' '}
                <Link to="/terms" className="text-charcoal-900 underline font-medium hover:text-brand-500">
                  Terms of Service
                </Link>{' '}
                &{' '}
                <Link to="/privacy-policy" className="text-charcoal-900 underline font-medium hover:text-brand-500">
                  Privacy Policy
                </Link>.
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* Phone display with Edit button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs">
                <div className="flex items-center gap-2 text-charcoal-900 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  <span>+91 {phoneInput.replace(/\D/g, '').slice(-10)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-brand-600 hover:underline font-bold text-xs"
                >
                  Change
                </button>
              </div>

              {/* Optional Name for New User */}
              {isNewUser && (
                <div>
                  <label className="block text-xs font-bold text-charcoal-900 mb-1">
                    Your Full Name <span className="text-gray-400 font-normal">(for orders & delivery)</span>
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Moumita Mukherjee"
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/60 focus:bg-white text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-1.5 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* OTP Digits Input */}
              <div>
                <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full text-center py-3 text-lg font-mono font-bold tracking-[0.5em] rounded-2xl border border-cream-300 bg-white focus:outline-none focus:ring-1.5 focus:ring-brand-500 text-charcoal-900 shadow-2xs"
                />
              </div>

              {/* Test OTP Helper Pill */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOtpInput('123456')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 hover:bg-gold-200 text-charcoal-900 font-bold text-[10px] transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  <span>Use Test OTP: 123456</span>
                </button>

                {timer > 0 ? (
                  <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Resend in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-brand-600 font-bold hover:underline text-[11px]"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpInput.length < 4}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Admin Login Footnote */}
          <div className="pt-4 border-t border-cream-100 text-center">
            <Link
              to="/admin"
              className="text-xs text-gray-400 hover:text-charcoal-900 transition-colors"
            >
              Store Administrator? Access Admin Portal &rarr;
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: User is Logged In -> Render Account Dashboard
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <SEO
        title="My Account | KurtiKatha (কুর্টিকথা)"
        description="View your order history, delivery status, saved delivery addresses, and personal profile details on KurtiKatha."
        url="/account"
      />

      {/* 1. Account Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-50 border-2 border-brand-500 text-brand-600 flex items-center justify-center font-bold text-xl shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-charcoal-900 tracking-tight">
                {user?.name || 'Customer'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-gold-100 text-charcoal-900 text-[10px] font-bold">
                Member
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-brand-500" />
              <span>+91 {user?.phone?.replace(/\D/g, '').slice(-10)}</span>
              {user?.email && !user.email.endsWith('@kurtikatha.customer') && (
                <>
                  <span>•</span>
                  <span>{user.email}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3.5 py-2 rounded-xl border border-cream-300 hover:bg-cream-100 text-xs font-semibold text-charcoal-900 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Edit Drawer / Form */}
      {isEditingProfile && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-charcoal-900">Update Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1.5 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1">Email Address (Optional for Invoices)</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1.5 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-cream-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'orders' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'addresses' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-gray-400 hover:text-charcoal-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({user?.addresses?.length || 0})</span>
        </button>

        <Link
          to="/account/wishlist"
          className="pb-3 text-gray-400 hover:text-charcoal-900 flex items-center gap-2 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>My Wishlist</span>
        </Link>
      </div>

      {/* 3. TAB 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-cream-200/80 shadow-2xs space-y-3">
              <Package className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-charcoal-900">No orders yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You haven't placed any orders yet. Discover our pure cotton kurtis and comfortable nighties.
              </p>
              <Link
                to="/shop"
                className="inline-block px-5 py-2.5 rounded-full bg-charcoal-900 text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-2xl p-5 border border-cream-200/80 shadow-card space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cream-100 text-xs">
                  <div>
                    <span className="font-bold text-charcoal-900">Order #{ord.orderNumber}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ord.orderStatus === 'delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : ord.orderStatus === 'cancelled'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gold-100 text-charcoal-900 border border-gold-300'
                  }`}>
                    {ord.orderStatus}
                  </span>
                </div>

                <div className="space-y-2">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300'}
                        alt={it.title}
                        className="w-12 h-14 object-cover rounded-lg bg-cream-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold text-charcoal-900 line-clamp-1">{it.title}</p>
                        <p className="text-gray-500 text-[11px]">
                          Size: {it.size} • Qty: {it.quantity} • ₹{it.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Payment: <strong className="text-charcoal-900 uppercase">{ord.payment?.method} ({ord.payment?.status})</strong>
                  </span>
                  <span className="font-bold text-sm text-charcoal-900">
                    Total: ₹{ord.amounts?.total}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. TAB 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-charcoal-900">Your Delivery Addresses</h3>
            <button
              type="button"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-black"
            >
              + Add Address
            </button>
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold text-charcoal-900 uppercase">New Delivery Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {(!user?.addresses || user.addresses.length === 0) ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-cream-200 text-xs text-gray-400">
              No saved addresses. Add an address for faster checkout.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div key={addr._id} className="bg-white rounded-2xl p-4 border border-cream-200/80 shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal-900">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{addr.addressLine}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-gray-500 text-[11px] pt-1">Phone: +91 {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
