'use client';

import { useState } from 'react';
import { BarChart, Bot, BrainCircuit, Coins, DollarSign, Zap } from 'lucide-react';
import { MetricCard } from './metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile, DashboardMetrics } from '@/lib/types';
import {
  getCoachAdviceAction,
  runFinancialAuditAction,
  getTechStackAction,
  deployWorkflowAction,
} from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import type { GetAICoachAdviceOutput } from '@/ai/flows/get-ai-coach-advice';
import type { FinancialAuditOutput } from '@/ai/flows/run-financial-audit';
import type { GenerateInitialTechStackRecommendationsOutput } from '@/ai/flows/generate-initial-tech-stack-recommendations';

export function DashboardClient() {
  const { user } = useUser();
  const firestore = useFirestore();

  type AiAction = 'coach' | 'audit' | 'tech' | 'workflow';
  type AiModalAction = Exclude<AiAction, 'workflow'>;
  type AiResult =
    | { action: 'coach'; data: GetAICoachAdviceOutput }
    | { action: 'audit'; data: FinancialAuditOutput }
    | { action: 'tech'; data: GenerateInitialTechStackRecommendationsOutput };

  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AiModalAction | null>(null);
  const [isAiRunning, setIsAiRunning] = useState<AiAction | null>(null);

  const { toast } = useToast();

  const metricsDocRef = useMemoFirebase(() => {
    if (!user) return null;
    // Reading from the top-level 'metrics' collection, keyed by user UID
    return doc(firestore, 'metrics', user.uid);
  }, [firestore, user]);
  const { data: metrics, isLoading: metricsLoading } = useDoc<DashboardMetrics>(metricsDocRef);

  const profileDocRef = useMemoFirebase(() => {
    if (!user) return null;
    // Reading from the top-level 'users' collection
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(profileDocRef);


  const loading = metricsLoading || profileLoading;

  const actionMetadata: Record<AiModalAction, { title: string; description: string }> = {
    coach: {
      title: 'Your AI Business Coach',
      description: 'Personalized advice to grow your business.',
    },
    audit: {
      title: 'Financial Audit Results',
      description: 'Discover savings and forecast future growth.',
    },
    tech: {
      title: 'Tech Stack Recommendation',
      description: 'The best tools to power your business.',
    },
  };

  const ensureDataForAction = (action: AiAction) => {
    if (action === 'coach') {
      if (!profile?.businessName) {
        toast({
          title: 'Profile Incomplete',
          description: 'Add your business name to your profile to receive coaching insights.',
          variant: 'destructive',
        });
        return false;
      }

      if (!metrics) {
        toast({
          title: 'Metrics Unavailable',
          description: 'We need your latest metrics before the coach can analyze your business.',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (action === 'tech' && !profile?.businessName) {
      toast({
        title: 'Profile Incomplete',
        description: 'Add your business name to unlock tailored tech stack recommendations.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const showAnalysisFailure = (message?: string) => {
    toast({
      title: 'Analysis Failed',
      description: message || 'An unexpected error occurred.',
      variant: 'destructive',
    });
  };

  const handleAiAction = async (action: AiAction) => {
    if (!ensureDataForAction(action)) {
      return;
    }

    setIsAiRunning(action);
    setAiResult(null);

    try {
      if (action === 'workflow') {
        const workflowResult = await deployWorkflowAction();
        toast({
          title: workflowResult.success ? 'Success' : 'Error',
          description: workflowResult.message,
          variant: workflowResult.success ? 'default' : 'destructive',
        });
        return;
      }
      if (action === 'coach') {
        const result = await getCoachAdviceAction(profile!.businessName!, metrics!, 'Launched a new ad campaign.');
        if (result.success) {
          setSelectedAction('coach');
          setAiResult({ action: 'coach', data: result.data });
          setIsModalOpen(true);
        } else {
          showAnalysisFailure(result.error);
        }
        return;
      }

      if (action === 'audit') {
        const result = await runFinancialAuditAction();
        if (result.success) {
          setSelectedAction('audit');
          setAiResult({ action: 'audit', data: result.data });
          setIsModalOpen(true);
        } else {
          showAnalysisFailure(result.error);
        }
        return;
      }

      const result = await getTechStackAction(profile!.businessName!);
      if (result.success) {
        setSelectedAction('tech');
        setAiResult({ action: 'tech', data: result.data });
        setIsModalOpen(true);
      } else {
        showAnalysisFailure(result.error);
      }
    } catch (error) {
      console.error('Error running AI action', error);
      showAnalysisFailure();
    } finally {
      setIsAiRunning(null);
    }
  };

  const renderAiResult = () => {
    if (!aiResult) return null;

    switch (aiResult.action) {
      case 'coach':
        return (
          <div className="space-y-4">
            <p className="font-semibold text-primary">Advice:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.data.advice}</p>
            <p className="font-semibold text-primary">Recommended Actions:</p>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.data.recommendedActions}</div>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-4">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertTitle>Projected Savings</AlertTitle>
              <AlertDescription className="text-2xl font-bold text-green-600">
                ${aiResult.data.projectedSavings.toLocaleString()}
              </AlertDescription>
            </Alert>
            <p className="font-semibold text-primary">Unused Subscriptions:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {aiResult.data.unusedSubscriptions.map(subscription => (
                <li key={subscription}>{subscription}</li>
              ))}
            </ul>
            <p className="font-semibold text-primary">Funnel Projections:</p>
            <p className="text-sm text-muted-foreground">{aiResult.data.funnelProjections}</p>
          </div>
        );
      case 'tech':
        return (
          <div className="space-y-4">
            <p className="font-semibold text-primary">Recommendations:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {aiResult.data.recommendations.map(tech => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            <p className="font-semibold text-primary">Reasoning:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.data.reasoning}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const selectedActionMeta = selectedAction ? actionMetadata[selectedAction] : null;

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedAction(null);
      setAiResult(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.displayName || 'Strategist'}. Here's your business overview.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading || !metrics ? (
            <>
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </>
        ) : (
            <>
                <MetricCard icon={BarChart} title="Lead Count" value={(metrics.leadCount || 0).toLocaleString()} />
                <MetricCard icon={Zap} title="Engagement Rate" value={`${metrics.engagementRate || 0}%`} />
                <MetricCard icon={Coins} title="Conversion Rate" value={`${metrics.conversionRate || 0}%`} />
            </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI-Powered Strategy Suite</CardTitle>
          <CardDescription>Leverage AI to make smarter business decisions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => handleAiAction('coach')} disabled={!!isAiRunning || loading}>
            {isAiRunning === 'coach' ? <Loader2 className="animate-spin" /> : <Bot />}
            AI Business Coach
          </Button>
          <Button onClick={() => handleAiAction('audit')} disabled={!!isAiRunning}>
             {isAiRunning === 'audit' ? <Loader2 className="animate-spin" /> : <DollarSign />}
            Run Financial Audit
          </Button>
           <Button onClick={() => handleAiAction('tech')} disabled={!!isAiRunning || loading}>
             {isAiRunning === 'tech' ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            Analyze Tech Stack
          </Button>
           <Button onClick={() => handleAiAction('workflow')} disabled={!!isAiRunning}>
             {isAiRunning === 'workflow' ? <Loader2 className="animate-spin" /> : <Zap />}
            Deploy Blueprint
          </Button>
        </CardContent>
      </Card>

        <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{selectedActionMeta?.title}</DialogTitle>
                    <DialogDescription>{selectedActionMeta?.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {renderAiResult()}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
