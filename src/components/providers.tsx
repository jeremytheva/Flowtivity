'use client';

import { AuthProvider } from '@/lib/hooks';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
