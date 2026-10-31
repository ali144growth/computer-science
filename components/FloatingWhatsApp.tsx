'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

export default function FloatingWhatsApp() {
  const { locale, t, mobileMenuOpen } = useLocale();

  const isRtl = locale === 'ar';
  const whatsappUrl =
    locale === 'ar'
      ? 'https://wa.me/96566773399?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B9%D9%85%D8%B1'
      : 'https://wa.me/96566773399?text=Hello%20Omar';

  return (
    <div
      className={`fixed bottom-6 z-30 transition-all duration-300 ${
        isRtl ? 'left-6' : 'right-6'
      } ${
        mobileMenuOpen
          ? 'opacity-0 pointer-events-none scale-90 translate-y-3'
          : 'opacity-100 pointer-events-auto scale-100 translate-y-0'
      }`}
      aria-hidden={mobileMenuOpen}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={mobileMenuOpen ? -1 : 0}
        aria-label={t.whatsappAria}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white shadow-xl shadow-[#3B82F6]/35 active:scale-95 transition-all group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B82F6]/50"
      >
        {/* Thin pulsing glass ring */}
        <span
          className="absolute -inset-2 rounded-full border border-[#3B82F6]/40 animate-glass-ring pointer-events-none"
          aria-hidden="true"
        />
        {/* Subtle static outer glass boundary */}
        <span
          className="absolute -inset-1 rounded-full border border-[#3B82F6]/30 bg-[#122544]/20 backdrop-blur-xs pointer-events-none"
          aria-hidden="true"
        />

        <MessageCircle className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}
