import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">Terms of Service & Privacy</h1>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-4 text-sm text-gray-700 leading-relaxed">
        <p>Welcome to KurtiKatha (কুর্টিকথা). By browsing or purchasing through this website, you agree to our fair usage and store terms.</p>
        <h3 className="font-bold text-charcoal-900">1. Pricing & Accuracy</h3>
        <p>All prices are listed in Indian Rupees (INR) and are inclusive of relevant GST taxes. We reserve the right to correct typographical errors.</p>
        <h3 className="font-bold text-charcoal-900">2. Privacy & Data Security</h3>
        <p>Your personal details (name, contact number, shipping address) are used exclusively for fulfilling your orders and communication. Payment information is securely handled via PCI-DSS compliant Razorpay servers; we never store your card numbers or UPI PINs.</p>
      </div>
    </div>
  );
}

