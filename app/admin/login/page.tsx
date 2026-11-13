'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Languages,
  Loader2,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { DEMO_CREDENTIALS, useAuth } from '@/lib/auth-context';

const LOGO_URL = 'https://ik.imagekit.io/imgy4/Images%20used%20in%20websites/p8.png';

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, toggleLocale } = useLocale();
  const {
    user,
    authReady,
    isAdmin,
    isDemoSession,
    authError,
    signInWithEmail,
    signInWithDemo,
    resendVerificationEmail,
    refreshUserSession,
    signOutUser,
    clearAuthError,
  } = useAuth();

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingInDemo, setSigningInDemo] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isAr = locale === 'ar';

  useEffect(() => {
    if (authReady && ((user && isAdmin) || isDemoSession)) {
      router.replace('/dashboard');
    }
  }, [authReady, user, isAdmin, isDemoSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSigningIn(true);
    setVerificationSent(false);
    clearAuthError();
    const ok = await signInWithEmail(email, password);
    setSigningIn(false);
    if (ok) {
      router.replace('/dashboard');
    }
  };

  const handleDemoSignIn = async () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setSigningInDemo(true);
    clearAuthError();
    const ok = await signInWithDemo();
    setSigningInDemo(false);
    if (ok) {
      router.replace('/dashboard');
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    const sent = await resendVerificationEmail();
    setSendingVerification(false);
    if (sent) {
      setVerificationSent(true);
    }
  };

  const handleRefreshSession = async () => {
    setRefreshingSession(true);
    const ok = await refreshUserSession();
    setRefreshingSession(false);
    if (ok) {
      router.replace('/dashboard');
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setVerificationSent(false);
    await signOutUser();
    setSigningOut(false);
  };

  const getErrorMessage = () => {
    if (authError === 'INVALID_CREDENTIALS') {
      return isAr
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : 'Invalid email address or password.';
    }
    if (authError === 'INVALID_EMAIL') {
      return isAr ? 'صيغة البريد الإلكتروني غير صالحة.' : 'Please enter a valid email address.';
    }
    if (authError === 'TOO_MANY_REQUESTS') {
      return isAr
        ? 'محاولات دخول متكررة. يرجى الانتظار قليلاً والمحاولة لاحقاً.'
        : 'Too many failed login attempts. Please wait a moment and try again.';
    }
    if (authError === 'PROVIDER_DISABLED') {
      return isAr
        ? 'يرجى تفعيل تسجيل الدخول بالبريد الإلكتروني وكلمة المرور من لوحة تحكم Firebase.'
        : 'Email/Password sign-in must be enabled in Firebase Console Authentication settings.';
    }
    if (
      authError === 'EMAIL_NOT_VERIFIED' ||
      (authReady && user && !user.emailVerified && !isDemoSession)
    ) {
      return isAr
        ? 'البريد الإلكتروني غير مُفعّل بعد. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.'
        : 'Your email address is not verified yet. Please verify your email before accessing the dashboard.';
    }
    if (
      authError === 'UNAUTHORIZED' ||
      (authReady && user && user.emailVerified && !isAdmin && !isDemoSession)
    ) {
      return isAr
        ? 'هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.'
        : 'This account is not authorized to access the admin dashboard.';
    }
    if (authError === 'LOGIN_FAILED') {
      return isAr
        ? 'تعذر إتمام تسجيل الدخول. يرجى المحاولة مرة أخرى.'
        : 'Unable to complete sign-in. Please try again.';
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const isUnverifiedSession = Boolean(
    authReady && user && !user.emailVerified && !isDemoSession
  );
  const isUnauthorizedSession = Boolean(
    authReady && user && user.emailVerified && !isAdmin && !isDemoSession
  );
  const isBusy = signingIn || signingInDemo;

  return (
    <div className="min-h-screen bg-[#0B1A33] text-[#F2F4F8] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6">
      {/* Top minimal bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between px-4 sm:px-6 py-3 rounded-2xl glass-panel">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#F2F4F8]/80 hover:text-[#3B82F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          <span>{isAr ? 'العودة إلى الموقع' : 'Back to Portfolio'}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLocale}
          aria-label={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-[#F2F4F8] bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          <Languages className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/30">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#3B82F6]/30 flex items-center justify-center p-2 mb-6">
              <Image
                src={LOGO_URL}
                alt="Portfolio Logo"
                width={48}
                height={48}
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-contain rounded-lg"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F4F8]">
              {isAr ? 'تسجيل دخول المشرف' : 'Admin Login'}
            </h1>
            <p className="mt-3 text-sm text-[#F2F4F8]/70 leading-relaxed">
              {isAr
                ? 'أدخل البريد الإلكتروني وكلمة المرور أو استخدم بيانات التجربة للدخول إلى لوحة التحكم.'
                : 'Enter your administrator email and password or use the demo credentials to access the dashboard.'}
            </p>
          </div>

          {!authReady ? (
            <div className="mt-8 flex items-center justify-center py-8">
              <Loader2 className="w-7 h-7 animate-spin text-[#3B82F6]" aria-label="Loading" />
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1">
                    <p>{errorMessage}</p>
                    {user?.email && (
                      <p className="text-xs text-red-300/80" dir="ltr">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {verificationSent && (
                <div
                  role="status"
                  className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm"
                >
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p>
                    {isAr
                      ? 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني.'
                      : 'Verification email sent. Please check your inbox and click the link.'}
                  </p>
                </div>
              )}

              {isUnverifiedSession ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={sendingVerification}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-sm font-medium transition-all disabled:opacity-60"
                  >
                    {sendingVerification ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>
                      {isAr ? 'إرسال رابط تفعيل البريد' : 'Send Verification Email'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshSession}
                    disabled={refreshingSession}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-[#3B82F6]/30 text-[#F2F4F8] text-sm font-medium transition-all disabled:opacity-60"
                  >
                    {refreshingSession ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{isAr ? 'تحقّق من التفعيل الآن' : 'I Have Verified, Continue'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-[#F2F4F8]/70 hover:text-white transition-colors"
                  >
                    {signingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : isUnauthorizedSession ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-[#3B82F6]/30 text-[#F2F4F8] text-sm font-medium transition-all disabled:opacity-60"
                >
                  {signingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>
                    {isAr ? 'تسجيل الخروج وتبديل الحساب' : 'Sign Out and Switch Account'}
                  </span>
                </button>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="admin-email"
                        className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5"
                      >
                        {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail
                          className="w-4 h-4 text-[#F2F4F8]/45 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          id="admin-email"
                          type="email"
                          required
                          autoComplete="email"
                          disabled={isBusy}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@example.com"
                          dir="ltr"
                          className="w-full py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 rounded-xl bg-[#0B1A33]/75 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="admin-password"
                        className="block text-xs font-medium text-[#F2F4F8]/75 mb-1.5"
                      >
                        {isAr ? 'كلمة المرور' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock
                          className="w-4 h-4 text-[#F2F4F8]/45 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none"
                          aria-hidden="true"
                        />
                        <input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          disabled={isBusy}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full py-2.5 ltr:pl-10 ltr:pr-10 rtl:pr-10 rtl:pl-10 rounded-xl bg-[#0B1A33]/75 border border-[#3B82F6]/25 focus:border-[#3B82F6] focus:outline-none text-sm text-[#F2F4F8] placeholder:text-[#F2F4F8]/35 disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword
                              ? isAr
                                ? 'إخفاء كلمة المرور'
                                : 'Hide password'
                              : isAr
                              ? 'إظهار كلمة المرور'
                              : 'Show password'
                          }
                          className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-[#F2F4F8]/45 hover:text-[#F2F4F8] transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] text-white text-sm font-medium transition-all shadow-lg shadow-[#3B82F6]/25 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-[#122544] mt-2"
                    >
                      {signingIn ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                      )}
                      <span>
                        {signingIn
                          ? isAr
                            ? 'جاري تسجيل الدخول...'
                            : 'Signing in...'
                          : isAr
                          ? 'تسجيل الدخول'
                          : 'Sign In'}
                      </span>
                    </button>
                  </form>

                  {/* Demo Credentials Quick Access Panel */}
                  <div className="pt-4 border-t border-[#3B82F6]/15 space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#0B1A33]/65 border border-[#3B82F6]/20 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-[#3B82F6] font-medium">
                        <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isAr ? 'بيانات الدخول التجريبية' : 'Demo Credentials'}</span>
                      </div>
                      <p className="text-[#F2F4F8]/75" dir="ltr">
                        Email: <span className="text-[#F2F4F8] font-medium">{DEMO_CREDENTIALS.email}</span>
                      </p>
                      <p className="text-[#F2F4F8]/75" dir="ltr">
                        Password: <span className="text-[#F2F4F8] font-medium">{DEMO_CREDENTIALS.password}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDemoSignIn}
                      disabled={isBusy}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#3B82F6]/30 hover:border-[#3B82F6] text-[#F2F4F8] text-xs sm:text-sm font-medium transition-all disabled:opacity-60"
                    >
                      {signingInDemo ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" aria-hidden="true" />
                      ) : (
                        <KeyRound className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
                      )}
                      <span>
                        {signingInDemo
                          ? isAr
                            ? 'جاري الدخول بالحساب التجريبي...'
                            : 'Signing in with Demo...'
                          : isAr
                          ? 'الدخول السريع ببيانات التجربة'
                          : 'Sign in with Demo Credentials'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-[#F2F4F8]/40">
        {isAr ? '© 2026 عمر الشطي. لوحة الإدارة.' : '© 2026 Omar Al-Shatti. Admin Portal.'}
      </footer>
    </div>
  );
}
