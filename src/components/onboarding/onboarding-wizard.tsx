'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const goals = [
    { id: 'leads', label: 'Generate More Leads' },
    { id: 'engagement', label: 'Increase Engagement' },
    { id: 'conversions', label: 'Improve Conversions' },
    { id: 'brand', label: 'Build Brand Awareness' },
];

const step1Schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  industry: z.string().min(2, 'Industry is required'),
});
const step2Schema = z.object({
  teamSize: z.enum(['1', '2-10', '11-50', '50+']),
  goals: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one goal.',
  }),
});
const formSchema = step1Schema.merge(step2Schema);

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(step === 1 ? step1Schema : step2Schema),
    defaultValues: {
      businessName: '',
      industry: '',
      teamSize: '1',
      goals: [],
    },
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const userDocRef = doc(firestore, 'users', user.uid);
    const metricsDocRef = doc(firestore, 'users', user.uid, 'metrics', 'data');
    
    const profileData = {
        ...data,
        onboardingComplete: true
    };
    const metricsData = {
        leadCount: 120,
        engagementRate: 45,
        conversionRate: 3.2,
    };

    const updateProfilePromise = updateDoc(userDocRef, profileData).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: profileData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error; // Re-throw to be caught by Promise.all
    });

    const setMetricsPromise = setDoc(metricsDocRef, metricsData).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: metricsDocRef.path,
        operation: 'create',
        requestResourceData: metricsData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error; // Re-throw to be caught by Promise.all
    });

    try {
        await Promise.all([updateProfilePromise, setMetricsPromise]);
        toast({ title: 'Profile Created!', description: "You're all set. Welcome aboard!" });
        router.push('/dashboard');
    } catch (error) {
        toast({ title: 'Error', description: 'Could not save your profile. Check permissions.', variant: 'destructive' });
        setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <Progress value={(step / 2) * 100} className="w-full" />
        
        {step === 1 && (
          <div className="space-y-4">
            <FormField
              control={methods.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Innovations" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SaaS, E-commerce" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <FormField
              control={methods.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Just Me</SelectItem>
                      <SelectItem value="2-10">2-10 people</SelectItem>
                      <SelectItem value="11-50">11-50 people</SelectItem>
                      <SelectItem value="50+">50+ people</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="goals"
              render={() => (
                <FormItem>
                    <FormLabel>Primary Business Goals</FormLabel>
                    <div className="space-y-2">
                    {goals.map((item) => (
                    <FormField
                      key={item.id}
                      control={methods.control}
                      name="goals"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 && <Button type="button" variant="outline" onClick={prevStep}>Back</Button>}
          <div className="flex-grow" />
          {step < 2 && <Button type="button" onClick={async () => {
              const isValid = await methods.trigger();
              if (isValid) nextStep();
          }}>Next</Button>}
          {step === 2 && <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish
          </Button>}
        </div>
      </form>
    </FormProvider>
  );
}
