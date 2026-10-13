import React from 'react';
import Logo from '../../components/common/Logo';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-3">
        <Logo size="lg" className="justify-center" />
        <h1 className="text-3xl font-extrabold text-charcoal-900 mt-4">The Story Behind KurtiKatha</h1>
        <p className="text-sm text-brand-600 font-semibold uppercase tracking-wider">
          Born in the bylanes of Kolkata, handcrafted for women across India
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-card space-y-6 text-sm text-gray-700 leading-relaxed">
        <p>
          <strong>KurtiKatha</strong> began with a simple observation: modern women in India needed ethnic daily wear that felt soft as a second skin, breathed easily through warm, humid summers, and didn't cost a fortune.
        </p>
        <p>
          "Katha" in Bengali means <em>a story, a conversation</em>. Every weave, Kantha stitch, and hand-block floral print tells a story of heritage artisan weavers from Bengal, Jaipur, and across India who have perfected cotton spinning for generations.
        </p>
        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 text-charcoal-900 font-medium">
          "Our promise is simple: 100% genuine breathable fabrics, true-to-size Indian fitting, transparent pricing with no hidden marks, and personal customer service whenever you reach out."
        </div>
        <p>
          Whether you pick one of our signature daily wear cotton kurtis or our comfortable pocket nighties, we thank you for welcoming KurtiKatha into your home.
        </p>
      </div>
    </div>
  );
}
