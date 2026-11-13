'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  db,
  BOOTSTRAP_ADMIN_EMAIL,
  testFirestoreConnection,
} from '@/lib/firebase';

export const DEMO_CREDENTIALS = {
  email: 'omar.alshatti@demo.dev',
  password: 'Demo@2026',
};

export const DEMO_SESSION_KEY = 'portfolio_demo_admin_session';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'INVALID_EMAIL'
  | 'TOO_MANY_REQUESTS'
  | 'PROVIDER_DISABLED'
  | 'EMAIL_NOT_VERIFIED'
  | 'UNAUTHORIZED'
  | 'LOGIN_FAILED'
  | null;

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isDemoSession: boolean;
  activeEmail: string;
  authError: AuthErrorCode;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithDemo: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshUserSession: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorCode>(null);

  const verifyAdminRole = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser || !currentUser.emailVerified) return false;
    if (currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
    try {
      const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
      return adminSnap.exists();
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const hasDemoSession =
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(DEMO_SESSION_KEY) === '1';

      if (currentUser) {
        const adminOk = await verifyAdminRole(currentUser);
        setIsAdmin(adminOk);
        setIsDemoSession(false);
      } else if (hasDemoSession) {
        setIsDemoSession(true);
        setIsAdmin(true);
      } else {
        setIsDemoSession(false);
        setIsAdmin(false);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [verifyAdminRole]);

  const signInWithDemo = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, '1');
    }
    setIsDemoSession(true);
    setIsAdmin(true);
    setAuthReady(true);
    return true;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setAuthError(null);
      const normalizedEmail = email.trim().toLowerCase();

      if (
        normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase() &&
        password === DEMO_CREDENTIALS.password
      ) {
        return signInWithDemo();
      }

      try {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!credential.user.emailVerified) {
          setIsAdmin(false);
          setIsDemoSession(false);
          setAuthError('EMAIL_NOT_VERIFIED');
          return false;
        }
        const adminOk = await verifyAdminRole(credential.user);
        setIsAdmin(adminOk);
        setIsDemoSession(false);
        if (!adminOk) {
          setAuthError('UNAUTHORIZED');
          return false;
        }
        return true;
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String((error as { code: string }).code)
            : '';
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          code === 'auth/user-not-found'
        ) {
          setAuthError('INVALID_CREDENTIALS');
        } else if (code === 'auth/invalid-email') {
          setAuthError('INVALID_EMAIL');
        } else if (code === 'auth/too-many-requests') {
          setAuthError('TOO_MANY_REQUESTS');
        } else if (code === 'auth/operation-not-allowed') {
          setAuthError('PROVIDER_DISABLED');
        } else {
          setAuthError('LOGIN_FAILED');
        }
        return false;
      }
    },
    [signInWithDemo, verifyAdminRole]
  );

  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshUserSession = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const refreshedUser = auth.currentUser;
      setUser(refreshedUser);
      if (!refreshedUser.emailVerified) {
        setAuthError('EMAIL_NOT_VERIFIED');
        setIsAdmin(false);
        return false;
      }
      const adminOk = await verifyAdminRole(refreshedUser);
      setIsAdmin(adminOk);
      if (!adminOk) {
        setAuthError('UNAUTHORIZED');
        return false;
      }
      setAuthError(null);
      return true;
    } catch {
      return false;
    }
  }, [verifyAdminRole]);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    }
    setIsDemoSession(false);
    setIsAdmin(false);
    if (auth.currentUser) {
      await signOut(auth);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const activeEmail = isDemoSession
    ? DEMO_CREDENTIALS.email
    : user?.email || '';

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        isDemoSession,
        activeEmail,
        authError,
        signInWithEmail,
        signInWithDemo,
        resendVerificationEmail,
        refreshUserSession,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
