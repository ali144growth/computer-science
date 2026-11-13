'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  Download,
  FileText,
  Languages,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import {
  DEMO_CV_STORAGE_KEY,
  DEMO_PROJECTS_STORAGE_KEY,
  DEMO_SETTINGS_STORAGE_KEY,
  useLocale,
} from '@/lib/locale-context';
import { DEFAULT_PROJECTS, PortfolioProject } from '@/lib/default-projects';
import ProjectModal from '@/components/dashboard/ProjectModal';

const LOGO_URL = 'https://ik.imagekit.io/imgy4/Images%20used%20in%20websites/p8.png';
const MAX_CV_BYTES = 700 * 1024;

interface CvRecord {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64Data: string;
  uploadedAt: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, authReady, isAdmin, isDemoSession, activeEmail, signOutUser } = useAuth();
  const { locale, toggleLocale, refreshPortfolioData } = useLocale();
  const isAr = locale === 'ar';

  // Data state
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [lastUpdatedEnabled, setLastUpdatedEnabled] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [cvData, setCvData] = useState<CvRecord | null>(null);

  // Action loading spinners & errors
  const [signingOut, setSigningOut] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [deletingCv, setDeletingCv] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Search & Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasAttemptedSeedRef = useRef(false);

  const isAuthorized = Boolean((user && isAdmin) || isDemoSession);

  // Redirect unauthenticated or non-admin users to /admin/login
  useEffect(() => {
    if (authReady && !isAuthorized) {
      router.replace('/admin/login');
    }
  }, [authReady, isAuthorized, router]);

  // Load demo data asynchronously when in Demo Session
  useEffect(() => {
    if (!authReady || !isDemoSession) return;
    let active = true;

    const loadDemoState = async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (!active || typeof window === 'undefined') return;

      const savedProjects = window.localStorage.getItem(DEMO_PROJECTS_STORAGE_KEY);
      if (savedProjects) {
        try {
          setProjects(JSON.parse(savedProjects) as PortfolioProject[]);
        } catch {
          setProjects(DEFAULT_PROJECTS);
        }
      } else {
        window.localStorage.setItem(DEMO_PROJECTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
        setProjects(DEFAULT_PROJECTS);
      }

      const savedSettings = window.localStorage.getItem(DEMO_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings) as {
            lastUpdatedEnabled?: boolean;
            lastUpdatedAt?: string | null;
          };
          setLastUpdatedEnabled(Boolean(parsed.lastUpdatedEnabled));
          setLastUpdatedAt(parsed.lastUpdatedAt ?? null);
        } catch {
          // ignore
        }
      }

      const savedCv = window.localStorage.getItem(DEMO_CV_STORAGE_KEY);
      if (savedCv) {
        try {
          setCvData(JSON.parse(savedCv) as CvRecord);
        } catch {
          // ignore
        }
      }

      setProjectsLoading(false);
    };

    void loadDemoState();
    return () => {
      active = false;
    };
  }, [authReady, isDemoSession]);

  // Attach authenticated Firestore listeners once authReady && user && isAdmin && !isDemoSession
  useEffect(() => {
    if (!authReady || !user || !isAdmin || isDemoSession) return;

    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(projectsRef, orderBy('date', 'desc'));

    const unsubProjects = onSnapshot(
      projectsQuery,
      async (snapshot) => {
        if (snapshot.empty && !hasAttemptedSeedRef.current) {
          hasAttemptedSeedRef.current = true;
          setSeedingDefaults(true);
          try {
            const batch = writeBatch(db);
            DEFAULT_PROJECTS.forEach((item) => {
              const docRef = doc(db, 'projects', item.id);
              batch.set(docRef, {
                title: item.title,
                titleAr: item.titleAr,
                description: item.description,
                descriptionAr: item.descriptionAr,
                date: item.date,
                imageUrl: item.imageUrl,
                demoUrl: item.demoUrl,
                ownerId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });
            await batch.commit();
            await refreshPortfolioData();
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'projects');
          } finally {
            setSeedingDefaults(false);
            setProjectsLoading(false);
          }
          return;
        }

        const list: PortfolioProject[] = snapshot.docs.map((d) => {
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
        setProjects(list);
        setProjectsLoading(false);
      },
      (error) => {
        setProjectsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLastUpdatedEnabled(Boolean(data.lastUpdatedEnabled));
          if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
            setLastUpdatedAt(data.updatedAt.toDate().toISOString());
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_settings/main');
      }
    );

    const unsubCv = onSnapshot(
      doc(db, 'cv_documents', 'active'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCvData({
            fileName: String(data.fileName || ''),
            mimeType: String(data.mimeType || 'application/pdf'),
            sizeBytes: Number(data.sizeBytes || 0),
            base64Data: String(data.base64Data || ''),
            uploadedAt:
              data.uploadedAt && typeof data.uploadedAt.toDate === 'function'
                ? data.uploadedAt.toDate().toISOString()
                : null,
          });
        } else {
          setCvData(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'cv_documents/active');
      }
    );

    return () => {
      unsubProjects();
      unsubSettings();
      unsubCv();
    };
  }, [authReady, user, isAdmin, isDemoSession, refreshPortfolioData]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.titleAr.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.descriptionAr.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace('/admin/login');
    } finally {
      setSigningOut(false);
    }
  };

  const handleToggleLastUpdated = async () => {
    if (!isAuthorized || togglingStatus) return;
    setActionError(null);
    setTogglingStatus(true);
    const nextValue = !lastUpdatedEnabled;

    if (isDemoSession) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const nowIso = new Date().toISOString();
      setLastUpdatedEnabled(nextValue);
      setLastUpdatedAt(nowIso);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          DEMO_SETTINGS_STORAGE_KEY,
          JSON.stringify({ lastUpdatedEnabled: nextValue, lastUpdatedAt: nowIso })
        );
      }
      await refreshPortfolioData();
      setTogglingStatus(false);
      return;
    }

    if (!user) {
      setTogglingStatus(false);
      return;
    }

    const path = 'site_settings/main';
    try {
      await setDoc(
        doc(db, 'site_settings', 'main'),
        {
          lastUpdatedEnabled: nextValue,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        { merge: true }
      );
      await refreshPortfolioData();
    } catch (error) {
      setActionError(
        isAr ? 'تعذر تحديث حالة المؤشر.' : 'Failed to update status widget setting.'
      );
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAuthorized) return;
    setActionError(null);

    if (file.size > MAX_CV_BYTES) {
      setActionError(
        isAr
          ? 'حجم الملف يتجاوز الحد الأقصى المسموح به (700 كيلوبايت).'
          : 'Selected file exceeds the maximum allowed size of 700 KB.'
      );
      e.target.value = '';
      return;
    }

    setUploadingCv(true);
    const path = 'cv_documents/active';

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
      });

      if (isDemoSession) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const nextCv: CvRecord = {
          fileName: file.name.slice(0, 200),
          mimeType: (file.type || 'application/pdf').slice(0, 100),
          sizeBytes: file.size,
          base64Data,
          uploadedAt: new Date().toISOString(),
        };
        setCvData(nextCv);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(DEMO_CV_STORAGE_KEY, JSON.stringify(nextCv));
        }
        return;
      }

      if (!user) return;

      await setDoc(doc(db, 'cv_documents', 'active'), {
        fileName: file.name.slice(0, 200),
        mimeType: (file.type || 'application/pdf').slice(0, 100),
        sizeBytes: file.size,
        base64Data,
        uploadedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
    } catch (error) {
      setActionError(isAr ? 'فشل رفع ملف السيرة الذاتية.' : 'Failed to upload CV file.');
      if (!isDemoSession) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } finally {
      setUploadingCv(false);
      e.target.value = '';
    }
  };

  const handleDeleteCv = async () => {
    if (!isAuthorized || deletingCv) return;
    setActionError(null);
    setDeletingCv(true);

    if (isDemoSession) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCvData(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DEMO_CV_STORAGE_KEY);
      }
      setDeletingCv(false);
      return;
    }

    const path = 'cv_documents/active';
    try {
      await deleteDoc(doc(db, 'cv_documents', 'active'));
    } catch (error) {
      setActionError(isAr ? 'فشل حذف السيرة الذاتية.' : 'Failed to delete CV file.');
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setDeletingCv(false);
    }
  };

  const handleSaveProject = async (data: Omit<PortfolioProject, 'id'>) => {
    if (!isAuthorized) return;
    setActionError(null);
    setSavingProject(true);

    try {
      if (isDemoSession) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        let updatedList: PortfolioProject[];
        if (editingProject) {
          updatedList = projects.map((p) =>
            p.id === editingProject.id ? { id: editingProject.id, ...data } : p
          );
        } else {
          const newProj: PortfolioProject = { id: `proj_${Date.now()}`, ...data };
          updatedList = [newProj, ...projects];
        }
        setProjects(updatedList);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(DEMO_PROJECTS_STORAGE_KEY, JSON.stringify(updatedList));
        }
        await refreshPortfolioData();
        setModalOpen(false);
        setEditingProject(null);
        return;
      }

      if (!user) return;

      if (editingProject) {
        const path = `projects/${editingProject.id}`;
        try {
          await updateDoc(doc(db, 'projects', editingProject.id), {
            title: data.title,
            titleAr: data.titleAr,
            description: data.description,
            descriptionAr: data.descriptionAr,
            date: data.date,
            imageUrl: data.imageUrl,
            demoUrl: data.demoUrl,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        const newId = `proj_${Date.now()}`;
        const path = `projects/${newId}`;
        try {
          await setDoc(doc(db, 'projects', newId), {
            title: data.title,
            titleAr: data.titleAr,
            description: data.description,
            descriptionAr: data.descriptionAr,
            date: data.date,
            imageUrl: data.imageUrl,
            demoUrl: data.demoUrl,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      await refreshPortfolioData();
      setModalOpen(false);
      setEditingProject(null);
    } catch {
      setActionError(isAr ? 'حدث خطأ أثناء حفظ المشروع.' : 'Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteTarget || deletingProjectId) return;
    setActionError(null);
    const targetId = deleteTarget.id;
    setDeletingProjectId(targetId);

    if (isDemoSession) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const updatedList = projects.filter((p) => p.id !== targetId);
      setProjects(updatedList);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DEMO_PROJECTS_STORAGE_KEY, JSON.stringify(updatedList));
      }
      await refreshPortfolioData();
      setDeleteTarget(null);
      setDeletingProjectId(null);
      return;
    }

    const path = `projects/${targetId}`;
    try {
      await deleteDoc(doc(db, 'projects', targetId));
      await refreshPortfolioData();
      setDeleteTarget(null);
    } catch (error) {
      setActionError(isAr ? 'تعذر حذف المشروع.' : 'Failed to delete project.');
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (!authReady || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0B1A33] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" aria-label="Loading dashboard" />
      </div>
    );
  }

  const formattedLastUpdated = lastUpdatedAt
    ? new Intl.DateTimeFormat(isAr ? 'ar-KW' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(lastUpdatedAt))
    : isAr
    ? 'لم يتم التحديث بعد'
    : 'Not updated yet';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="min-h-screen bg-[#0B1A33] text-[#F2F4F8] pb-16">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 rounded-2xl glass-panel shadow-lg shadow-black/20">
          {/* Logo and "Dashboard" text */}
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-lg"
          >
            <Image
              src={LOGO_URL}
              alt="Logo"
              width={36}
              height={36}
              referrerPolicy="no-referrer"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shrink-0"
            />
            <span className="text-base sm:text-lg font-semibold tracking-tight text-[#F2F4F8]">
              {isAr ? 'لوحة التحكم' : 'Dashboard'}
            </span>
          </Link>

          {/* Right controls: email, language toggle, sign out */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Authenticated Email */}
            <span
              dir="ltr"
              title={activeEmail}
              className="hidden sm:inline-block max-w-[200px] md:max-w-[260px] truncate text-xs sm:text-sm text-[#F2F4F8]/75"
            >
              {activeEmail}
            </span>

            {/* Language toggle button */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg text-[#F2F4F8] bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              <Languages className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
              <span className="hidden sm:inline sm:ms-2">{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Sign out button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/5 hover:bg-red-500/15 border border-[#3B82F6]/30 hover:border-red-400/50 text-xs sm:text-sm font-medium text-[#F2F4F8] hover:text-red-200 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              {signingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>

          {/* Mobile email row */}
          <div className="w-full sm:hidden pt-2 border-t border-[#3B82F6]/15 flex items-center justify-between text-xs text-[#F2F4F8]/70">
            <span className="truncate" dir="ltr">
              {activeEmail}
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {actionError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-xs underline hover:text-white"
            >
              {isAr ? 'إخفاء' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Top Row: Last Updated Toggle Widget + CV Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Last Updated Widget Toggle Button with Green LED Indicator */}
          <section
            aria-label={isAr ? 'مؤشر آخر تحديث' : 'Last Updated Widget'}
            className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Green Status Light / LED Indicator */}
                <span className="relative flex h-3.5 w-3.5" aria-hidden="true">
                  {lastUpdatedEnabled && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3.5 w-3.5 transition-all duration-300 ${
                      lastUpdatedEnabled
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                        : 'bg-slate-500/70'
                    }`}
                  />
                </span>

                <h2 className="text-lg sm:text-xl font-semibold text-[#F2F4F8]">
                  {isAr ? 'مؤشر آخر تحديث' : 'Last Updated Widget'}
                </h2>
              </div>

              {/* Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={lastUpdatedEnabled}
                aria-label={isAr ? 'تبديل مؤشر آخر تحديث' : 'Toggle last updated widget'}
                onClick={handleToggleLastUpdated}
                disabled={togglingStatus}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] disabled:opacity-60 ${
                  lastUpdatedEnabled
                    ? 'bg-emerald-500/25 border-emerald-400/60'
                    : 'bg-white/5 border-[#3B82F6]/30'
                }`}
              >
                {togglingStatus ? (
                  <span className="mx-auto">
                    <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-md transition-transform duration-200 ${
                      lastUpdatedEnabled
                        ? 'bg-emerald-400 ltr:translate-x-7 rtl:-translate-x-7'
                        : 'bg-[#F2F4F8]/70 ltr:translate-x-1 rtl:-translate-x-1'
                    }`}
                  />
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-[#3B82F6]/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#F2F4F8]/65">
              <span>
                {isAr ? 'الحالة:' : 'Status:'}{' '}
                <strong className={lastUpdatedEnabled ? 'text-emerald-400' : 'text-[#F2F4F8]/80'}>
                  {lastUpdatedEnabled
                    ? isAr
                      ? 'مفعّل'
                      : 'Active'
                    : isAr
                    ? 'معطّل'
                    : 'Off'}
                </strong>
              </span>
              <span>
                {isAr ? 'آخر تعديل:' : 'Updated:'} {formattedLastUpdated}
              </span>
            </div>
          </section>

          {/* 2. Section to Upload CV */}
          <section
            aria-label={isAr ? 'إدارة السيرة الذاتية' : 'CV Upload'}
            className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#F2F4F8]">
                  {isAr ? 'رفع السيرة الذاتية (CV)' : 'Upload CV'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#F2F4F8]/65">
                  {isAr
                    ? 'قم برفع ملف السيرة الذاتية بصيغة PDF أو Word (بحد أقصى 700 كيلوبايت).'
                    : 'Upload your latest CV in PDF or Word format (max 700 KB).'}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={handleCvFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCv || deletingCv}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-[#3B82F6]/20 shrink-0 disabled:opacity-60"
              >
                {uploadingCv ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="w-4 h-4" aria-hidden="true" />
                )}
                <span>
                  {uploadingCv
                    ? isAr
                      ? 'جاري الرفع...'
                      : 'Uploading...'
                    : isAr
                    ? 'رفع ملف'
                    : 'Upload CV'}
                </span>
              </button>
            </div>

            {cvData ? (
              <div className="p-4 rounded-2xl bg-[#0B1A33]/60 border border-[#3B82F6]/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F2F4F8] truncate" dir="ltr">
                      {cvData.fileName}
                    </p>
                    <p className="text-xs text-[#F2F4F8]/55">
                      {formatFileSize(cvData.sizeBytes)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={cvData.base64Data}
                    download={cvData.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 text-xs font-medium text-[#F2F4F8] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#3B82F6]" aria-hidden="true" />
                    <span>{isAr ? 'تحميل' : 'Download'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDeleteCv}
                    disabled={deletingCv}
                    aria-label={isAr ? 'حذف السيرة الذاتية' : 'Delete CV'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-300 transition-colors disabled:opacity-60"
                  >
                    {deletingCv ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0B1A33]/40 border border-dashed border-[#3B82F6]/25 text-center text-xs sm:text-sm text-[#F2F4F8]/50">
                {isAr ? 'لم يتم رفع سيرة ذاتية بعد.' : 'No CV uploaded yet.'}
              </div>
            )}
          </section>
        </div>

        {/* 3. Projects Management Section */}
        <section
          aria-label={isAr ? 'جدول المشاريع' : 'Projects Table'}
          className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* Toolbar above the table: stacked on small screens, side-by-side on large screens */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 lg:max-w-md">
              <Search
                className="w-4 h-4 text-[#F2F4F8]/50 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'ابحث باسم المشروع أو الوصف...'
                    : 'Search projects by name, description, or date...'
                }
                aria-label={isAr ? 'البحث في المشاريع' : 'Search projects'}
                className="w-full py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 rounded-xl bg-[#0B1A33]/70 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/40"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProject(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] text-white text-sm font-medium transition-all shadow-md shadow-[#3B82F6]/25 w-full lg:w-auto"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{isAr ? 'إضافة مشروع جديد' : 'Add New Project'}</span>
            </button>
          </div>

          {/* Projects Table */}
          {projectsLoading || seedingDefaults ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-sm text-[#F2F4F8]/65">
              <Loader2 className="w-7 h-7 animate-spin text-[#3B82F6]" aria-hidden="true" />
              <span>{isAr ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#3B82F6]/15">
              <table className="w-full border-collapse text-start">
                <thead>
                  <tr className="bg-[#0B1A33]/80 border-b border-[#3B82F6]/20 text-xs uppercase tracking-wider text-[#F2F4F8]/65">
                    <th className="py-3.5 px-4 font-semibold text-start">
                      {isAr ? 'اسم المشروع' : 'Project Name'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-start">
                      {isAr ? 'الوصف' : 'Description'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-start whitespace-nowrap">
                      {isAr ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-end whitespace-nowrap">
                      {isAr ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B82F6]/10 text-sm">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 px-4 text-center text-sm text-[#F2F4F8]/50"
                      >
                        {isAr ? 'لا توجد مشاريع مطابقة للبحث.' : 'No matching projects found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => {
                      const isRowDeleting = deletingProjectId === project.id;
                      const displayTitle = isAr ? project.titleAr : project.title;
                      const displayDesc = isAr ? project.descriptionAr : project.description;

                      return (
                        <tr
                          key={project.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-[#F2F4F8] min-w-[200px]">
                            {displayTitle}
                          </td>
                          <td className="py-4 px-4 text-[#F2F4F8]/75 max-w-md">
                            <p className="line-clamp-2">{displayDesc}</p>
                          </td>
                          <td className="py-4 px-4 text-[#F2F4F8]/70 whitespace-nowrap" dir="ltr">
                            {project.date}
                          </td>
                          <td className="py-4 px-4 text-end whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProject(project);
                                  setModalOpen(true);
                                }}
                                disabled={isRowDeleting}
                                aria-label={isAr ? `تعديل ${displayTitle}` : `Edit ${displayTitle}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/25 text-xs font-medium text-[#F2F4F8] hover:text-[#3B82F6] transition-colors disabled:opacity-50"
                              >
                                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{isAr ? 'تعديل' : 'Edit'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(project)}
                                disabled={isRowDeleting}
                                aria-label={isAr ? `حذف ${displayTitle}` : `Delete ${displayTitle}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-medium text-red-300 transition-colors disabled:opacity-50"
                              >
                                {isRowDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                )}
                                <span>{isAr ? 'حذف' : 'Delete'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Project Modal */}
      <ProjectModal
        key={modalOpen ? editingProject?.id ?? 'new' : 'closed'}
        isOpen={modalOpen}
        isAr={isAr}
        editingProject={editingProject}
        isSaving={savingProject}
        onClose={() => {
          if (!savingProject) {
            setModalOpen(false);
            setEditingProject(null);
          }
        }}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0B1A33]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5">
            <h2 id="delete-modal-title" className="text-lg font-semibold text-[#F2F4F8]">
              {isAr ? 'تأكيد حذف المشروع' : 'Confirm Project Deletion'}
            </h2>
            <p className="text-sm text-[#F2F4F8]/75 leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف "${deleteTarget.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(deletingProjectId)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#F2F4F8]/80 bg-white/5 hover:bg-white/10 border border-[#3B82F6]/20 transition-colors disabled:opacity-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                disabled={Boolean(deletingProjectId)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-70 min-w-[110px]"
              >
                {deletingProjectId && (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                )}
                <span>
                  {deletingProjectId
                    ? isAr
                      ? 'جاري الحذف...'
                      : 'Deleting...'
                    : isAr
                    ? 'حذف'
                    : 'Delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
