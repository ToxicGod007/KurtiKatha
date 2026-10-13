import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ 
  phoneNumber = '918697449885', 
  defaultMessage = 'Hello KurtiKatha! I would like to know more about your collection.' 
}) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="Quick WhatsApp assistance">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-3.5 py-3 rounded-full shadow-elevated transition-transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        aria-label="Chat with KurtiKatha on WhatsApp (+91 86974 49885)"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Chat on WhatsApp
        </span>
        {/* Subtle Ping Animation Ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
      </a>
    </aside>
  );
}

