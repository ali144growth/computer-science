'use client';

import React from 'react';
import { useLocale } from '@/lib/locale-context';

export default function FloatingLastUpdated() {
  const { locale, t, lastUpdatedEnabled, lastUpdatedAt, mobileMenuOpen } = useLocale();

  if (!lastUpdatedEnabled || !lastUpdatedAt) {
    return null;
  }

  const isRtl = locale === 'ar';
  const formattedDate = new Intl.DateTimeFormat(isRtl ? 'ar-KW' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(lastUpdatedAt));

  return (
    <aside
      aria-label={t.footer.lastUpdatedPrefix}
      aria-hidden={mobileMenuOpen}
      className={`fixed bottom-6 z-30 transition-all duration-300 max-w-[calc(100vw-6.5rem)] ${
        isRtl ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
      } ${
        mobileMenuOpen
          ? 'opacity-0 pointer-events-none scale-95 translate-y-2'
          : 'opacity-100 pointer-events-auto scale-100 translate-y-0'
      }`}
    >
      <div className="glass-panel rounded-xl px-3.5 py-2 shadow-lg shadow-black/25 flex items-center gap-2.5 text-[11px] sm:text-xs text-[#F2F4F8]/85">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </span>
        <span className="truncate">
          {t.footer.lastUpdatedPrefix}: {formattedDate}
        </span>
      </div>
    </aside>
  );
}
