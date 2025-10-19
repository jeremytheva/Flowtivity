'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's `md` breakpoint

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // window is only available on the client
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set the initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
