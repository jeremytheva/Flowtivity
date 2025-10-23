'use client';

import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function OnboardingCheck({ children }: { children: ReactNode }) {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (authLoading || !firestore) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // No need to check if we are on the onboarding page
    if (pathname.startsWith('/onboarding')) {
      setProfileChecked(true);
      return;
    }

    const checkProfile = async () => {
      const businessProfileRef = doc(firestore, 'users', user.uid);
      try {
        const businessProfileSnap = await getDoc(businessProfileRef);
        
        if (!businessProfileSnap.exists() || !businessProfileSnap.data()?.onboardingComplete) {
          router.replace('/onboarding');
        } else {
          setProfileChecked(true);
        }
      } catch (e) {
         const permissionError = new FirestorePermissionError({
          path: businessProfileRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    };

    checkProfile();
  }, [user, authLoading, router, pathname, firestore]);

  if (!profileChecked || authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
