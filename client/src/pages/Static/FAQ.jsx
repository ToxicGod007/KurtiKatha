import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      q: 'Are your kurtis and nighties made from 100% pure cotton?',
      a: 'Yes! Most of our daily wear line is crafted from 100% pre-shrunk combed cotton. Where a piece uses a special blend like Rayon Slub or Chanderi, the fabric composition is clearly specified in the product description.'
    },
    {
      q: 'How do I choose the right size?',
      a: 'We follow standard Indian garment sizing (in inches: Bust measurement). You can check our interactive Size Guide on any product page. If you prefer a loose, relaxed fit for summer wear or nighties, we recommend sizing up.'
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'Simply choose COD at checkout. You pay the courier executive in cash or via mobile UPI QR code upon parcel delivery.'
    },
    {
      q: 'What is your return/exchange policy?',
      a: 'We offer a 7-day hassle-free exchange for size or manufacturing issues. Reach out to +91 86974 49885 via WhatsApp or phone with your order number.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-charcoal-900">{f.q}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
