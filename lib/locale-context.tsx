'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface ProjectItem {
  id: string;
  title: string;
  image: string;
  demoUrl: string;
}

interface Translations {
  nav: {
    work: string;
    contact: string;
    switchLang: string;
    langLabel: string;
  };
  hero: {
    headline: string;
  };
  work: {
    sectionTitle: string;
    viewDemo: string;
  };
  contact: {
    sectionTitle: string;
    phoneLabel: string;
    phoneValue: string;
    whatsappLabel: string;
    whatsappValue: string;
    emailLabel: string;
    emailValue: string;
    locationLabel: string;
    locationValue: string;
    githubLabel: string;
    linkedinLabel: string;
  };
  whatsappAria: string;
}

const contentData: Record<Locale, { t: Translations; projects: ProjectItem[] }> = {
  en: {
    t: {
      nav: {
        work: 'Work',
        contact: 'Contact',
        switchLang: 'العربية',
        langLabel: 'Switch to Arabic',
      },
      hero: {
        headline: 'Omar Al-Shatti',
      },
      work: {
        sectionTitle: 'Web Development Projects',
        viewDemo: 'View Demo',
      },
      contact: {
        sectionTitle: 'Contact',
        phoneLabel: 'Phone',
        phoneValue: '+965 6677 3399',
        whatsappLabel: 'WhatsApp',
        whatsappValue: '+965 6677 3399',
        emailLabel: 'Email',
        emailValue: 'omar.alshatti@example.com',
        locationLabel: 'Location',
        locationValue: 'Kuwait City, Kuwait',
        githubLabel: 'GitHub',
        linkedinLabel: 'LinkedIn',
      },
      whatsappAria: 'Chat on WhatsApp',
    },
    projects: [
      {
        id: 'p1',
        title: 'Construction Company Landing Page',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/construction-landing-page',
      },
      {
        id: 'p2',
        title: 'University LMS Learning Management System',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/university-lms-portal',
      },
      {
        id: 'p3',
        title: 'Website Figma Design System',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/figma-web-design-system',
      },
      {
        id: 'p4',
        title: 'Real Estate Property Portal Website',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/real-estate-portal',
      },
      {
        id: 'p5',
        title: 'Medical Clinic Appointment Website',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/clinic-appointment-site',
      },
      {
        id: 'p6',
        title: 'Modern E-Commerce Storefront Website',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/ecommerce-storefront-web',
      },
    ],
  },
  ar: {
    t: {
      nav: {
        work: 'الأعمال',
        contact: 'التواصل',
        switchLang: 'English',
        langLabel: 'التحويل إلى الإنجليزية',
      },
      hero: {
        headline: 'عمر الشطي',
      },
      work: {
        sectionTitle: 'مشاريع تطوير المواقع',
        viewDemo: 'عرض المشروع',
      },
      contact: {
        sectionTitle: 'التواصل',
        phoneLabel: 'الهاتف',
        phoneValue: '+965 6677 3399',
        whatsappLabel: 'واتساب',
        whatsappValue: '+965 6677 3399',
        emailLabel: 'البريد الإلكتروني',
        emailValue: 'omar.alshatti@example.com',
        locationLabel: 'الموقع',
        locationValue: 'مدينة الكويت، الكويت',
        githubLabel: 'جيت هَب',
        linkedinLabel: 'لينكد إن',
      },
      whatsappAria: 'تواصل عبر واتساب',
    },
    projects: [
      {
        id: 'p1',
        title: 'صفحة هبوط لشركة مقاولات وإنشاءات',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/construction-landing-page',
      },
      {
        id: 'p2',
        title: 'نظام إدارة التعلم الجامعي الإلكتروني LMS',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/university-lms-portal',
      },
      {
        id: 'p3',
        title: 'تصميم واجهة موقع إلكتروني عبر فيغما',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/figma-web-design-system',
      },
      {
        id: 'p4',
        title: 'موقع وبوابة عقارية تفاعلية للبحث عن العقارات',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/real-estate-portal',
      },
      {
        id: 'p5',
        title: 'موقع حجز مواعيد العيادات والمراكز الطبية',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/clinic-appointment-site',
      },
      {
        id: 'p6',
        title: 'موقع متجر إلكتروني متكامل وسريع',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
        demoUrl: 'https://github.com/omaralshatti/ecommerce-storefront-web',
      },
    ],
  },
};

interface LocaleContextValue {
  locale: Locale;
  dir: Direction;
  toggleLocale: () => void;
  setLocale: (l: Locale) => void;
  t: Translations;
  projects: ProjectItem[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Synchronize HTML element lang and dir attributes dynamically
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
  };

  const { t, projects } = contentData[locale];

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dir,
        toggleLocale,
        setLocale,
        t,
        projects,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      <div dir={dir} lang={locale} className="min-h-screen bg-[#0B1A33] text-[#F2F4F8] antialiased">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
