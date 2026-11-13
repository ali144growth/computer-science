'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="w-full py-8 border-t border-[#3B82F6]/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <p className="text-xs text-[#F2F4F8]/50">{t.footer.copyright}</p>

        <Link
          href="/admin/login"
          className="text-xs font-medium text-[#3B82F6] hover:text-blue-400 transition-colors relative py-0.5 after:absolute after:bottom-0 after:inset-x-0 after:h-[1px] after:bg-[#3B82F6] after:scale-x-0 hover:after:scale-x-100 after:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
        >
          {t.footer.dashboardLink}
        </Link>
      </div>
    </footer>
  );
}
