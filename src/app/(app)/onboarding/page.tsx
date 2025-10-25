import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome to SoloStrategist OS</CardTitle>
          <CardDescription>Let's set up your business profile to personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingWizard />
        </CardContent>
      </Card>
    </div>
  );
}
