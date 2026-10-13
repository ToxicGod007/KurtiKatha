import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  };

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-1.5 group select-none ${className}`}
      aria-label="KurtiKatha Home"
    >
      {/* Decorative Traditional Paisley / Boutique Motif Icon */}
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-50 border-2 border-brand-500 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
        <span className="text-brand-500 font-bold text-base leading-none">ক</span>
      </div>

      <div className="flex items-baseline tracking-tight">
        {/* "Kurti" in Latin Script */}
        <span className={`font-sans font-bold text-brand-500 tracking-tight transition-colors group-hover:text-brand-600 ${sizeClasses[size]}`}>
          Kurti
        </span>
        {/* "কথা" in Bengali Script with Golden-Yellow Accent */}
        <span className={`font-bengali font-extrabold text-gold-500 drop-shadow-xs ml-0.5 transition-colors group-hover:text-gold-600 ${sizeClasses[size]}`}>
          কথা
        </span>
      </div>
    </Link>
  );
}

