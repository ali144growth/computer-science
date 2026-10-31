'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useLocale } from '@/lib/locale-context';

export default function Hero() {
  const { t } = useLocale();
  const [imageError, setImageError] = useState(false);

  const heroImageUrl =
    'https://ik.imagekit.io/imgy4/Images%20used%20in%20websites/Neon%20Kuwait%20Skyline%20Office%20at%20Night.png';

  return (
    <section
      aria-label="Hero"
      className="relative w-full min-h-[82vh] md:min-h-[88vh] flex items-center justify-center overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      {/* Full-bleed background image container */}
      <div className="absolute inset-0 z-0 bg-[#0B1A33]">
        {!imageError && (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            referrerPolicy="no-referrer"
            className="object-cover object-center scale-105 motion-safe:transition-transform motion-safe:duration-1000"
            onError={() => setImageError(true)}
          />
        )}
        {/* Dark navy overlay ensuring strict WCAG AAA contrast and seamless tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A33]/80 via-[#0B1A33]/65 to-[#0B1A33]" />
        {/* Subtle radial glow in accent blue behind the text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#3B82F6]/10 blur-[130px] pointer-events-none rounded-full" />
      </div>

      {/* Hero content: strictly the single h1 element with only the name */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center py-24 sm:py-28">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#F2F4F8] leading-tight max-w-4xl mx-auto"
        >
          {t.hero.headline}
        </motion.h1>
      </div>
    </section>
  );
}
