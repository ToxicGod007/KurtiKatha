import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@kurtikatha.com');
  const [password, setPassword] = useState('Admin@KurtiKatha2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Access denied. This account does not have administrator privileges.');
          return;
        }
        setUser(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" className="justify-center" />
          <h2 className="text-xl font-extrabold text-charcoal-900 mt-2">Admin Portal Login</h2>
          <p className="text-xs text-gray-500">
            Sign in with store administrator credentials to manage products, orders, and shop settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-900 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-900 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Log In as Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-[11px] text-gray-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Role-based protected route with secure httpOnly JWT authentication.</span>
        </div>
      </div>
    </div>
  );
}

