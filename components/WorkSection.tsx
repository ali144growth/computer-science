'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

export default function WorkSection() {
  const { t, projects } = useLocale();

  return (
    <section id="work" aria-label={t.work.sectionTitle} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header with minimal dot indicator */}
        <div className="mb-12 sm:mb-16 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F8]">
            {t.work.sectionTitle}
          </h2>
        </div>

        {/* Responsive grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {projects.map((project) => (
            <article
              key={project.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Item 1: Project image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#122544]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122544]/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Card body: strictly Title + View Demo button */}
              <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between gap-6">
                {/* Item 2: Project title */}
                <h3 className="text-lg sm:text-xl font-medium text-[#F2F4F8] leading-snug">
                  {project.title}
                </h3>

                {/* Item 3: View Demo button */}
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white text-sm font-medium transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-[#122544]"
                >
                  <span>{t.work.viewDemo}</span>
                  <ExternalLink className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
