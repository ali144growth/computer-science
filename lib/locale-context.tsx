'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_PROJECTS, PortfolioProject } from '@/lib/default-projects';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export const DEMO_PROJECTS_STORAGE_KEY = 'portfolio_demo_projects_v1';
export const DEMO_SETTINGS_STORAGE_KEY = 'portfolio_demo_settings_v1';
export const DEMO_CV_STORAGE_KEY = 'portfolio_demo_cv_v1';

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
  footer: {
    copyright: string;
    dashboardLink: string;
    lastUpdatedPrefix: string;
  };
  whatsappAria: string;
}

const contentData: Record<Locale, Translations> = {
  en: {
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
    footer: {
      copyright: '© 2026 Omar Al-Shatti. Computer Science Student, Gulf University.',
      dashboardLink: 'Dashboard',
      lastUpdatedPrefix: 'Last updated',
    },
    whatsappAria: 'Chat on WhatsApp',
  },
  ar: {
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
    footer: {
      copyright: '© 2026 عمر الشطي. طالب علوم حاسوب، جامعة الخليج.',
      dashboardLink: 'لوحة التحكم',
      lastUpdatedPrefix: 'آخر تحديث',
    },
    whatsappAria: 'تواصل عبر واتساب',
  },
};

interface LocaleContextValue {
  locale: Locale;
  dir: Direction;
  toggleLocale: () => void;
  setLocale: (l: Locale) => void;
  t: Translations;
  projects: ProjectItem[];
  lastUpdatedEnabled: boolean;
  lastUpdatedAt: string | null;
  refreshPortfolioData: () => Promise<void>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [rawProjects, setRawProjects] = useState<PortfolioProject[]>(DEFAULT_PROJECTS);
  const [lastUpdatedEnabled, setLastUpdatedEnabled] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  const refreshPortfolioData = useCallback(async () => {
    // Check if demo edits exist locally first
    if (typeof window !== 'undefined') {
      const demoProjectsRaw = window.localStorage.getItem(DEMO_PROJECTS_STORAGE_KEY);
      if (demoProjectsRaw) {
        try {
          const parsed = JSON.parse(demoProjectsRaw) as PortfolioProject[];
          if (Array.isArray(parsed)) {
            setRawProjects(parsed);
          }
        } catch {
          // ignore malformed cache
        }
      }

      const demoSettingsRaw = window.localStorage.getItem(DEMO_SETTINGS_STORAGE_KEY);
      if (demoSettingsRaw) {
        try {
          const parsedSettings = JSON.parse(demoSettingsRaw) as {
            lastUpdatedEnabled?: boolean;
            lastUpdatedAt?: string | null;
          };
          setLastUpdatedEnabled(Boolean(parsedSettings.lastUpdatedEnabled));
          setLastUpdatedAt(parsedSettings.lastUpdatedAt ?? null);
        } catch {
          // ignore malformed cache
        }
      }
    }

    try {
      const projectsQuery = query(collection(db, 'projects'), orderBy('date', 'desc'));
      const snapshot = await getDocs(projectsQuery);
      if (!snapshot.empty) {
        const fetched: PortfolioProject[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title || ''),
            titleAr: String(data.titleAr || data.title || ''),
            description: String(data.description || ''),
            descriptionAr: String(data.descriptionAr || data.description || ''),
            date: String(data.date || ''),
            imageUrl: String(data.imageUrl || ''),
            demoUrl: String(data.demoUrl || ''),
          };
        });
        setRawProjects(fetched);
      }
    } catch {
      // Keep cached or default projects if Firestore collection is not yet populated
    }

    try {
      const settingsSnap = await getDoc(doc(db, 'site_settings', 'main'));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setLastUpdatedEnabled(Boolean(data.lastUpdatedEnabled));
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          setLastUpdatedAt(data.updatedAt.toDate().toISOString());
        }
      }
    } catch {
      // Keep cached settings if Firestore doc is not yet populated
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await refreshPortfolioData();
    };
    void load();
    return () => {
      active = false;
    };
  }, [refreshPortfolioData]);

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
  };

  const t = contentData[locale];

  const projects: ProjectItem[] = rawProjects.map((item) => ({
    id: item.id,
    title: locale === 'ar' ? item.titleAr || item.title : item.title,
    image: item.imageUrl,
    demoUrl: item.demoUrl,
  }));

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dir,
        toggleLocale,
        setLocale,
        t,
        projects,
        lastUpdatedEnabled,
        lastUpdatedAt,
        refreshPortfolioData,
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
