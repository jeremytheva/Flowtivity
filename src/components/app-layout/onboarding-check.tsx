'use client';

import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
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

  if (isChecking) {
    // If checking on a page OTHER than onboarding, show a full-page loader
    // to hide the content before the redirect happens.
    if (!pathname.startsWith('/onboarding')) {
      return (
        <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    // If we are on the onboarding page itself, don't render a big loader.
    // Let the page content render normally.
    return null;
  }

  // Once loading is complete, render children only if the user is onboarded
  // or is on the onboarding page itself.
  if (userProfile?.onboardingComplete || pathname.startsWith('/onboarding')) {
    return <>{children}</>;
  }

  // Otherwise, render a loading state until the redirect is complete.
  return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
}
