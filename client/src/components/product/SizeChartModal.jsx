import React, { useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';

const SIZE_DATA = {
  kurtis: [
    { size: 'XS', bust: '34', waist: '30', hip: '38', length: '44' },
    { size: 'S', bust: '36', waist: '32', hip: '40', length: '44' },
    { size: 'M', bust: '38', waist: '34', hip: '42', length: '44' },
    { size: 'L', bust: '40', waist: '36', hip: '44', length: '44' },
    { size: 'XL', bust: '42', waist: '38', hip: '46', length: '45' },
    { size: 'XXL', bust: '44', waist: '40', hip: '48', length: '45' },
    { size: '3XL', bust: '46', waist: '42', hip: '50', length: '45' },
  ],
  nighties: [
    { size: 'Free Size (M/L/XL)', bust: '38-42', waist: 'Loose Relaxed', hip: 'Free', length: '54-55' },
    { size: 'XXL (Comfort Fit)', bust: '44-46', waist: 'Loose Relaxed', hip: 'Free', length: '55-56' },
    { size: '3XL (Plus Size)', bust: '48-50', waist: 'Loose Relaxed', hip: 'Free', length: '56' },
  ],
};

export default function SizeChartModal({ isOpen, onClose, category = 'kurtis' }) {
  const [activeTab, setActiveTab] = useState(category.toLowerCase().includes('night') ? 'nighties' : 'kurtis');
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  if (!isOpen) return null;

  const data = SIZE_DATA[activeTab] || SIZE_DATA.kurtis;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-elevated transition-all sm:my-8 sm:w-full sm:max-w-xl">
          
          {/* Header */}
          <div className="bg-cream-50 p-5 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-bold text-charcoal-900">KurtiKatha Size Guide (Indian Fit)</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="touch-target p-2 rounded-full hover:bg-cream-200 text-charcoal-900"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Category toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex rounded-xl bg-cream-100 p-1 border border-cream-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('kurtis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'kurtis' ? 'bg-white text-brand-500 shadow-2xs' : 'text-gray-500 hover:text-charcoal-900'
                  }`}
                >
                  Kurtis & Sets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nighties')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'nighties' ? 'bg-white text-brand-500 shadow-2xs' : 'text-gray-500 hover:text-charcoal-900'
                  }`}
                >
                  Daily Nighties
                </button>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Unit: <span className="font-bold text-charcoal-900">Inches (in)</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-cream-200 shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-cream-100/70 text-charcoal-900 font-bold border-b border-cream-200">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    <th className="py-2.5 px-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {data.map((row) => (
                    <tr key={row.size} className="hover:bg-cream-50/50">
                      <td className="py-2.5 px-3 font-bold text-brand-600">{row.size}</td>
                      <td className="py-2.5 px-3 font-medium text-charcoal-900">{row.bust}"</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.waist}{row.waist.includes('Loose') ? '' : '"'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.hip}{row.hip === 'Free' ? '' : '"'}</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.length}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sizing tip */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Fitting Recommendation:</strong> All our cotton fabrics are pre-shrunk. For hot Indian summers or relaxed everyday comfort in nighties, we recommend choosing your regular size or one size up for a breezy drape.
              </p>
            </div>
          </div>

          <div className="bg-cream-50 px-6 py-3 border-t border-cream-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-charcoal-900 text-white font-bold text-xs hover:bg-black transition-colors"
            >
              Got it
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

