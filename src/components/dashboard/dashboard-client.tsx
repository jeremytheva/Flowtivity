'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bot, BrainCircuit, Coins, DollarSign, Zap, FileText, ChevronRight } from 'lucide-react';
import { MetricCard } from './metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BusinessProfile, DashboardMetrics } from '@/lib/types';
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

export function DashboardClient() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [aiResult, setAiResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [isAiRunning, setIsAiRunning] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const metricsUnsub = onSnapshot(doc(db, 'users', user.uid, 'metrics', 'data'), (doc) => {
        if (doc.exists()) {
            setMetrics(doc.data() as DashboardMetrics);
        } else {
            setMetrics({ leadCount: 120, engagementRate: 45, conversionRate: 3.2 });
        }
    });

    const profileUnsub = onSnapshot(doc(db, 'users', user.uid, 'businessProfile', 'data'), (doc) => {
        if (doc.exists()) {
            setProfile(doc.data() as BusinessProfile);
        }
        setLoading(false);
    });

    return () => {
      metricsUnsub();
      profileUnsub();
    };
  }, [user]);

  const handleAiAction = async (action: 'coach' | 'audit' | 'tech' | 'workflow') => {
    setIsAiRunning(action);
    setAiResult(null);

    let result;
    if (action === 'coach') {
        if (!profile) return;
        setModalTitle('Your AI Business Coach');
        setModalDescription('Personalized advice to grow your business.');
        result = await getCoachAdviceAction(profile.businessName, metrics || { leadCount: 0, engagementRate: 0, conversionRate: 0 }, 'Launched a new ad campaign.');
    } else if (action === 'audit') {
        setModalTitle('Financial Audit Results');
        setModalDescription('Discover savings and forecast future growth.');
        result = await runFinancialAuditAction();
    } else if (action === 'tech') {
        if (!profile) return;
        setModalTitle('Tech Stack Recommendation');
        setModalDescription('The best tools to power your business.');
        result = await getTechStackAction(profile.businessName);
    } else if (action === 'workflow') {
        const workflowResult = await deployWorkflowAction();
        toast({
            title: workflowResult.success ? 'Success' : 'Error',
            description: workflowResult.message,
            variant: workflowResult.success ? 'default' : 'destructive',
        });
        setIsAiRunning(null);
        return;
    }
    
    if (result && result.success) {
      setAiResult(result.data);
      setIsModalOpen(true);
    } else {
      toast({
        title: 'Analysis Failed',
        description: result?.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }

    setIsAiRunning(null);
  };

    const renderAiResult = () => {
        if (!aiResult) return null;
        if (modalTitle.includes('Coach')) {
            return (
                <div className="space-y-4">
                    <p className="font-semibold text-primary">Advice:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.advice}</p>
                    <p className="font-semibold text-primary">Recommended Actions:</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.recommendedActions}</div>
                </div>
            );
        }
        if (modalTitle.includes('Audit')) {
            return (
                <div className="space-y-4">
                    <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertTitle>Projected Savings</AlertTitle>
                        <AlertDescription className="text-2xl font-bold text-green-600">${aiResult.projectedSavings.toLocaleString()}</AlertDescription>
                    </Alert>
                     <p className="font-semibold text-primary">Unused Subscriptions:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {aiResult.unusedSubscriptions.map((sub: string) => <li key={sub}>{sub}</li>)}
                    </ul>
                    <p className="font-semibold text-primary">Funnel Projections:</p>
                    <p className="text-sm text-muted-foreground">{aiResult.funnelProjections}</p>
                </div>
            );
        }
        if (modalTitle.includes('Tech Stack')) {
            return (
                <div className="space-y-4">
                    <p className="font-semibold text-primary">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {aiResult.recommendations.map((tech: string) => <li key={tech}>{tech}</li>)}
                    </ul>
                    <p className="font-semibold text-primary">Reasoning:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResult.reasoning}</p>
                </div>
            );
        }
        return null;
    };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'Strategist'}. Here's your business overview.</p>
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
                <MetricCard icon={BarChart} title="Lead Count" value={metrics.leadCount.toLocaleString()} />
                <MetricCard icon={Zap} title="Engagement Rate" value={`${metrics.engagementRate}%`} />
                <MetricCard icon={Coins} title="Conversion Rate" value={`${metrics.conversionRate}%`} />
            </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI-Powered Strategy Suite</CardTitle>
          <CardDescription>Leverage AI to make smarter business decisions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => handleAiAction('coach')} disabled={!!isAiRunning}>
            {isAiRunning === 'coach' ? <Loader2 className="animate-spin" /> : <Bot />}
            AI Business Coach
          </Button>
          <Button onClick={() => handleAiAction('audit')} disabled={!!isAiRunning}>
             {isAiRunning === 'audit' ? <Loader2 className="animate-spin" /> : <DollarSign />}
            Run Financial Audit
          </Button>
           <Button onClick={() => handleAiAction('tech')} disabled={!!isAiRunning}>
             {isAiRunning === 'tech' ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            Analyze Tech Stack
          </Button>
           <Button onClick={() => handleAiAction('workflow')} disabled={!!isAiRunning}>
             {isAiRunning === 'workflow' ? <Loader2 className="animate-spin" /> : <Zap />}
            Deploy Blueprint
          </Button>
        </CardContent>
      </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{modalTitle}</DialogTitle>
                    <DialogDescription>{modalDescription}</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {renderAiResult()}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
