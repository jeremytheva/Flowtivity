'use client';

import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase, useDoc } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export function OnboardingCheck({ children }: { children: ReactNode }) {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const isChecking = authLoading || profileLoading;

  useEffect(() => {
    if (isChecking) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // No need to check if we are already on the onboarding page
    if (pathname.startsWith('/onboarding')) {
      return;
    }

    if (!userProfile?.onboardingComplete) {
        router.replace('/onboarding');
    }

  }, [user, userProfile, isChecking, router, pathname]);

  if (isChecking || (user && !pathname.startsWith('/onboarding') && !userProfile?.onboardingComplete)) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
