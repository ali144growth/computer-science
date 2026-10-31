'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Github, Linkedin, Check } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

export default function ContactSection() {
  const { t } = useLocale();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedItem(id);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  return (
    <section id="contact" aria-label={t.contact.sectionTitle} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section title with subtle dot indicator */}
        <div className="mb-12 sm:mb-16 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F8]">
            {t.contact.sectionTitle}
          </h2>
        </div>

        {/* Single glass panel enclosing all contact points */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 shadow-xl shadow-black/20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
            {/* 1. Phone number (tap to call) */}
            <div className="flex flex-col items-center text-center group">
              <a
                href={`tel:${t.contact.phoneValue.replace(/\s+/g, '')}`}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label={`${t.contact.phoneLabel}: ${t.contact.phoneValue}`}
              >
                <Phone className="w-6 h-6" aria-hidden="true" />
              </a>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.phoneLabel}
              </span>
              <a
                href={`tel:${t.contact.phoneValue.replace(/\s+/g, '')}`}
                dir="ltr"
                className="text-sm sm:text-base font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors"
              >
                {t.contact.phoneValue}
              </a>
            </div>

            {/* 2. WhatsApp direct link */}
            <div className="flex flex-col items-center text-center group">
              <a
                href="https://wa.me/96566773399"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label={`${t.contact.whatsappLabel}: ${t.contact.whatsappValue}`}
              >
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
              </a>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.whatsappLabel}
              </span>
              <a
                href="https://wa.me/96566773399"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="text-sm sm:text-base font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors"
              >
                {t.contact.whatsappValue}
              </a>
            </div>

            {/* 3. Email */}
            <div className="flex flex-col items-center text-center group">
              <a
                href={`mailto:${t.contact.emailValue}`}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label={`${t.contact.emailLabel}: ${t.contact.emailValue}`}
              >
                <Mail className="w-6 h-6" aria-hidden="true" />
              </a>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.emailLabel}
              </span>
              <a
                href={`mailto:${t.contact.emailValue}`}
                dir="ltr"
                className="text-sm sm:text-base font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors break-all"
              >
                {t.contact.emailValue}
              </a>
            </div>

            {/* 4. Location */}
            <div className="flex flex-col items-center text-center group">
              <div
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shadow-sm mb-4"
                aria-hidden="true"
              >
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.locationLabel}
              </span>
              <span className="text-sm sm:text-base font-medium text-[#F2F4F8]">
                {t.contact.locationValue}
              </span>
            </div>

            {/* 5. GitHub Profile */}
            <div className="flex flex-col items-center text-center group">
              <a
                href="https://github.com/omaralshatti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label={t.contact.githubLabel}
              >
                <Github className="w-6 h-6" aria-hidden="true" />
              </a>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.githubLabel}
              </span>
              <a
                href="https://github.com/omaralshatti"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="text-sm sm:text-base font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors"
              >
                github.com/omaralshatti
              </a>
            </div>

            {/* 6. LinkedIn Profile */}
            <div className="flex flex-col items-center text-center group">
              <a
                href="https://linkedin.com/in/omar-alshatti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label={t.contact.linkedinLabel}
              >
                <Linkedin className="w-6 h-6" aria-hidden="true" />
              </a>
              <span className="text-xs uppercase tracking-wider text-[#F2F4F8]/60 font-medium mb-1">
                {t.contact.linkedinLabel}
              </span>
              <a
                href="https://linkedin.com/in/omar-alshatti"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="text-sm sm:text-base font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors"
              >
                linkedin.com/in/omar-alshatti
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
