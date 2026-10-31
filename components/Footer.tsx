'use client';

import React from 'react';
import { useLocale } from '@/lib/locale-context';

export default function Footer() {
  const { locale } = useLocale();

  return (
    <footer className="w-full py-8 border-t border-[#3B82F6]/10 text-center px-4">
      <p className="text-xs text-[#F2F4F8]/50">
        {locale === 'ar'
          ? '© 2026 عمر الشطي. طالب علوم حاسوب، جامعة الخليج.'
          : '© 2026 Omar Al-Shatti. Computer Science Student, Gulf University.'}
      </p>
    </footer>
  );
}
