import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { db, auth } from '@/lib/firebase';
import { BusinessProfile, DashboardMetrics } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { headers } from 'next/headers';

async function getDashboardData(uid: string): Promise<{ profile: BusinessProfile | null; metrics: DashboardMetrics | null }> {
  try {
    const profileDocRef = doc(db, 'users', uid, 'businessProfile', 'data');
    const metricsDocRef = doc(db, 'users', uid, 'metrics', 'data');

    const [profileSnap, metricsSnap] = await Promise.all([
      getDoc(profileDocRef),
      getDoc(metricsDocRef),
    ]);
    
    const profile = profileSnap.exists() ? (profileSnap.data() as BusinessProfile) : null;
    
    // Provide default metrics if they don't exist
    const metrics = metricsSnap.exists()
      ? (metricsSnap.data() as DashboardMetrics)
      : { leadCount: 0, engagementRate: 0, conversionRate: 0 };
      
    return { profile, metrics };
  } catch (error) {
    console.error("Error fetching dashboard data: ", error);
    return { 
        profile: null, 
        metrics: { leadCount: 0, engagementRate: 0, conversionRate: 0 } 
    };
  }
}

// Dummy function to get UID on the server. In a real app with server-side auth, this would be different.
async function getUserId() {
    // This is a placeholder for server-side auth.
    // In a real app, you would get the user from a session cookie.
    // For this project, we'll assume a client-side auth flow and this page is protected.
    // This function will not work as expected on the server without a proper auth setup.
    // We will handle data fetching on the client side in this case.
    return null;
}


export default async function DashboardPage() {
    // Since Firebase client auth is used, we cannot reliably get the user on the server.
    // We will fetch the data on the client side in DashboardClient.
    return <DashboardClient />;
}
