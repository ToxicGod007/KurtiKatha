import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ 
  phoneNumber = '918697449885', 
  defaultMessage = 'Hello KurtiKatha! I would like to know more about your collection.' 
}) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="Customer WhatsApp Support">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-18 lg:bottom-6 right-4 lg:right-6 z-30 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white p-2.5 sm:px-3.5 sm:py-2.5 rounded-full shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
        aria-label="Chat with KurtiKatha on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="hidden sm:inline text-xs font-semibold tracking-tight">
          Help
        </span>
      </a>
    </aside>
  );
}
