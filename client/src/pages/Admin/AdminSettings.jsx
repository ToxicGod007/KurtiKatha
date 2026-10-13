import React, { useState, useEffect } from 'react';
import { Save, Phone, MessageSquare, Truck, ShieldCheck, Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    contactPhone: '+91 86974 49885',
    whatsappNumber: '918697449885',
    supportEmail: 'support@kurtikatha.com',
    shippingFee: 69,
    freeShippingThreshold: 999,
    codEnabled: true,
    announcementText: '✨ FREE Shipping on orders above ₹999 | New Festive Kurtis In Stock!',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setFormData({
          contactPhone: res.settings.contactPhone || '+91 86974 49885',
          whatsappNumber: res.settings.whatsappNumber || '918697449885',
          supportEmail: res.settings.supportEmail || 'support@kurtikatha.com',
          shippingFee: res.settings.shippingFee ?? 69,
          freeShippingThreshold: res.settings.freeShippingThreshold ?? 999,
          codEnabled: res.settings.codEnabled ?? true,
          announcementText: res.settings.announcementText || '✨ FREE Shipping on orders above ₹999 | New Festive Kurtis In Stock!',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await api.updateSettings(formData);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Store settings updated successfully! Changes are immediately live for customers.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-brand-500" />
        <span className="text-sm font-medium">Loading store settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Shop Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage contact channels, delivery rules, checkout toggles, and live announcement banner.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-200 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-100">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Contact & Customer Support</h2>
              <p className="text-[11px] text-gray-500">Visible in header, footer, invoices, and WhatsApp button</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                Display Phone Number
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 86974 49885"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Formatted for display (e.g. +91 86974 49885)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                WhatsApp API Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="918697449885"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
                <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Country code without + or spaces (e.g. 918697449885)</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                Support Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="support@kurtikatha.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Rules */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-200 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Shipping & Delivery Rates</h2>
              <p className="text-[11px] text-gray-500">Auto-calculated during zero-trust server checkout pricing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                Standard Shipping Fee (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.shippingFee}
                  onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Applied to carts below the free threshold</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
                Free Shipping Threshold (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Cart subtotal at which delivery becomes ₹0</span>
            </div>
          </div>
        </div>

        {/* Payment Gateways & Policies */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-200 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Payment Methods & COD Switch</h2>
              <p className="text-[11px] text-gray-500">Enable or disable Cash on Delivery across the entire store</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border border-cream-200">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-charcoal-900 block">Cash on Delivery (COD)</span>
              <p className="text-[11px] text-gray-500">
                Allow customers to pay via cash or UPI QR upon delivery to their doorstep.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Top Announcement Bar */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-cream-200 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-100">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
              📢
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Header Announcement Strip</h2>
              <p className="text-[11px] text-gray-500">Displayed at the very top of the customer storefront</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-900 mb-1.5">
              Announcement Message
            </label>
            <textarea
              rows="2"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. FREE Shipping on orders above ₹999 | New Festive Kurtis In Stock!"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
