'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import { Languages, Menu, X, Phone, MessageCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { locale, dir, toggleLocale, t, mobileMenuOpen, setMobileMenuOpen } = useLocale();

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const isRtl = dir === 'rtl';

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-3">
        <nav
          aria-label="Main Navigation"
          className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5 rounded-2xl glass-panel shadow-lg shadow-black/20"
        >
          {/* Student name / brand mark */}
          <a
            href="#"
            className="text-sm sm:text-base font-semibold tracking-wide text-[#F2F4F8] hover:text-[#3B82F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
          >
            {locale === 'ar' ? 'عمر الشطي' : 'Omar Al-Shatti'}
          </a>

          {/* Right-side controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Desktop section jump links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#work"
                className="text-sm font-medium text-[#F2F4F8]/80 hover:text-[#F2F4F8] transition-colors relative py-1 after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#3B82F6] after:origin-bottom after:scale-x-0 hover:after:scale-x-100 after:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
              >
                {t.nav.work}
              </a>
              <a
                href="#contact"
                className="text-sm font-medium text-[#F2F4F8]/80 hover:text-[#F2F4F8] transition-colors relative py-1 after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#3B82F6] after:origin-bottom after:scale-x-0 hover:after:scale-x-100 after:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
              >
                {t.nav.contact}
              </a>
            </div>

            {/* Language toggle button: in mobile view it strictly shows ONLY the icon */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t.nav.langLabel}
              title={t.nav.langLabel}
              className="flex items-center justify-center p-2 md:px-3 md:py-1.5 text-xs sm:text-sm font-medium rounded-lg text-[#F2F4F8] bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              <Languages className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
              {/* Text label visible ONLY on tablet/desktop, hidden on mobile */}
              <span className="hidden md:inline md:ms-2">{t.nav.switchLang}</span>
            </button>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={locale === 'ar' ? 'فتح القائمة الرئيسية' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#F2F4F8] bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              <Menu className="w-5 h-5 text-[#F2F4F8]" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Animated Sliding Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#0B1A33]/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`absolute top-0 bottom-0 ${
                isRtl ? 'left-0 border-r' : 'right-0 border-l'
              } w-[280px] max-w-[85vw] bg-[#122544]/95 backdrop-blur-xl border-[#3B82F6]/25 p-6 flex flex-col justify-between shadow-2xl shadow-black/50`}
            >
              {/* Drawer Top: Name & Close button */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#3B82F6]/15">
                  <span className="text-sm font-semibold tracking-wide text-[#F2F4F8]">
                    {locale === 'ar' ? 'عمر الشطي' : 'Omar Al-Shatti'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label={locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
                    className="p-1.5 rounded-lg text-[#F2F4F8]/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#3B82F6]/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation links */}
                <nav className="mt-8 flex flex-col gap-3">
                  <a
                    href="#work"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[#F2F4F8] bg-white/5 hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] border border-[#3B82F6]/20 transition-all"
                  >
                    <span>{t.nav.work}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                  </a>

                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[#F2F4F8] bg-white/5 hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] border border-[#3B82F6]/20 transition-all"
                  >
                    <span>{t.nav.contact}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                  </a>
                </nav>
              </div>

              {/* Drawer Bottom: Quick actions */}
              <div className="pt-6 border-t border-[#3B82F6]/15 flex flex-col gap-3">
                <div className="flex items-center justify-around gap-2">
                  <a
                    href={`tel:${t.contact.phoneValue.replace(/\s+/g, '')}`}
                    aria-label={t.contact.phoneLabel}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white border border-[#3B82F6]/30 transition-all"
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://wa.me/96566773399"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.contact.whatsappLabel}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white border border-[#3B82F6]/30 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  </a>
                  <a
                    href={`mailto:${t.contact.emailValue}`}
                    aria-label={t.contact.emailLabel}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-[#3B82F6] text-[#3B82F6] hover:text-white border border-[#3B82F6]/30 transition-all"
                  >
                    <Mail className="w-5 h-5" aria-hidden="true" />
                  </a>
                </div>
                <p className="text-center text-[11px] text-[#F2F4F8]/40 mt-1">
                  {locale === 'ar'
                    ? 'طالب علوم حاسوب، جامعة الخليج'
                    : 'Computer Science Student, Gulf University'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
