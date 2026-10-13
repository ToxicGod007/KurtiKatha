import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-charcoal-900">Contact KurtiKatha</h1>
        <p className="text-sm text-gray-600">
          We are here to help you with sizes, orders, shipping, and styling advice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Contact Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-6">
          <h2 className="text-xl font-bold text-charcoal-900">Get in Touch</h2>
          
          <div className="space-y-4">
            <a 
              href="tel:+918697449885"
              className="flex items-center gap-4 p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors border border-cream-200"
            >
              <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Customer Support Phone</p>
                <p className="text-base font-bold text-charcoal-900">+91 86974 49885</p>
              </div>
            </a>

            <a 
              href="https://wa.me/918697449885?text=Hi%20KurtiKatha%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-medium">WhatsApp Assistance</p>
                <p className="text-base font-bold text-emerald-900">+91 86974 49885</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
              <div className="w-12 h-12 rounded-full bg-charcoal-900 text-white flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Enquiries</p>
                <p className="text-base font-bold text-charcoal-900">support@kurtikatha.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
              <div className="w-12 h-12 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Working Hours</p>
                <p className="text-base font-bold text-charcoal-900">Mon - Sat: 10:00 AM - 9:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Send message form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h2 className="text-xl font-bold text-charcoal-900">Send Us a Message</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our support team will get back to you within 24 hours.'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1">Your Full Name</label>
              <input type="text" required placeholder="e.g. Priya Banerjee" className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1">Phone Number / WhatsApp</label>
              <input type="tel" required placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-900 mb-1">How can we help?</label>
              <textarea rows={4} required placeholder="Tell us your enquiry or question..." className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
