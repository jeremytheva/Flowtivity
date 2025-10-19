import { AppHeader } from "@/components/app-layout/app-header";
import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { OnboardingCheck } from "@/components/app-layout/onboarding-check";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <OnboardingCheck>
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </OnboardingCheck>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
