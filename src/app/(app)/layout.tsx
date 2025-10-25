import { AppHeader } from "@/components/app-layout/app-header";
import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { OnboardingCheck } from "@/components/app-layout/onboarding-check";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-background">
        <AppSidebar />
        <main className="md:pl-12 transition-[padding] group-data-[sidebar-state=expanded]/sidebar-wrapper:md:pl-64">
            <AppHeader />
            <OnboardingCheck>
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </OnboardingCheck>
        </main>
      </div>
    </SidebarProvider>
  );
}
