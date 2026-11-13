'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { LocaleProvider } from '@/lib/locale-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </AuthProvider>
  );
}
