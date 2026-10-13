import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">Shipping & Delivery Policy</h1>
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-900">1. Free Shipping Threshold</h2>
          <p>We provide <strong>FREE Shipping</strong> all over India on all prepaid and COD orders with a bag value exceeding <strong>₹999</strong>. For orders below ₹999, a nominal flat shipping fee of <strong>₹69</strong> is applied.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-900">2. Dispatch & Delivery Timelines</h2>
          <p>Orders are dispatched from our Kolkata warehouse within 24–48 hours of confirmation. Delivery typically takes <strong>3 to 5 business days</strong> depending on your pincode location.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-900">3. Cash on Delivery (COD)</h2>
          <p>Cash on Delivery is available across most serviceable pin codes in India. Please keep exact change ready during courier arrival.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-900">4. Order Tracking</h2>
          <p>Once your parcel is handed to our courier partners (Delhivery, BlueDart, DTDC), a live tracking number and link are sent via SMS / WhatsApp.</p>
        </section>
      </div>
    </div>
  );
}
