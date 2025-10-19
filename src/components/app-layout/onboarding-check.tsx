'use client';

import { useAuth } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function OnboardingCheck({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;

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
      const businessProfileRef = doc(db, 'users', user.uid, 'businessProfile', 'data');
      const businessProfileSnap = await getDoc(businessProfileRef);
      
      if (!businessProfileSnap.exists()) {
        router.replace('/onboarding');
      } else {
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user, authLoading, router, pathname]);

  if (!profileChecked || authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
