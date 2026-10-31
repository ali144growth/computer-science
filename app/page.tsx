'use client';

import React from 'react';
import { LocaleProvider } from '@/lib/locale-context';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorkSection from '@/components/WorkSection';
import ContactSection from '@/components/ContactSection';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <LocaleProvider>
      <main className="min-h-screen relative selection:bg-[#3B82F6] selection:text-[#0B1A33]">
        {/* Floating / Sticky navigation strip */}
        <Navbar />

        {/* Section 1: Hero (strictly single h1 over full-bleed workspace image) */}
        <Hero />

        {/* Section 2: Work (Projects) */}
        <WorkSection />

        {/* Section 3: Contact */}
        <ContactSection />

        {/* Persistent Floating WhatsApp Button */}
        <FloatingWhatsApp />

        {/* Minimal Footer */}
        <Footer />
      </main>
    </LocaleProvider>
  );
}
