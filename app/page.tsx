'use client';

import React, { useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorkSection from '@/components/WorkSection';
import ContactSection from '@/components/ContactSection';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import FloatingLastUpdated from '@/components/FloatingLastUpdated';
import Footer from '@/components/Footer';

export default function HomePage() {
  const { refreshPortfolioData } = useLocale();

  useEffect(() => {
    void refreshPortfolioData();
  }, [refreshPortfolioData]);

  return (
    <main className="min-h-screen relative selection:bg-[#3B82F6] selection:text-[#0B1A33]">
      {/* Floating / Sticky navigation strip */}
      <Navbar />

      {/* Section 1: Hero (strictly single h1 over full-bleed workspace image) */}
      <Hero />

      {/* Section 2: Work (Projects) */}
      <WorkSection />

      {/* Section 3: Contact */}
      <ContactSection />

      {/* Persistent Floating Last Updated Status Widget */}
      <FloatingLastUpdated />

      {/* Persistent Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Minimal Footer */}
      <Footer />
    </main>
  );
}
