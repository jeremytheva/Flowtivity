'use server';

import { getAICoachAdvice } from '@/ai/flows/get-ai-coach-advice';
import { runFinancialAudit } from '@/ai/flows/run-financial-audit';
import { generateInitialTechStackRecommendations } from '@/ai/flows/generate-initial-tech-stack-recommendations';
import { revalidatePath } from 'next/cache';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { GetAICoachAdviceOutput } from '@/ai/flows/get-ai-coach-advice';
import type { FinancialAuditOutput } from '@/ai/flows/run-financial-audit';
import type { GenerateInitialTechStackRecommendationsOutput } from '@/ai/flows/generate-initial-tech-stack-recommendations';

type ActionSuccess<T> = { success: true; data: T };
type ActionFailure = { success: false; error: string };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export async function getCoachAdviceAction(
  businessDescription: string,
  metrics: { leadCount: number; engagementRate: number; conversionRate: number },
  recentActions: string,
): Promise<ActionResult<GetAICoachAdviceOutput>> {
  try {
    const advice = await getAICoachAdvice({
      businessDescription,
      ...metrics,
      recentActions,
    });
    return { success: true, data: advice };
  } catch (error) {
    console.error('Error getting AI coach advice:', error);
    return { success: false, error: 'Failed to get AI coach advice.' };
  }
}

export async function runFinancialAuditAction(): Promise<ActionResult<FinancialAuditOutput>> {
  try {
    const auditResults = await runFinancialAudit();
    return { success: true, data: auditResults };
  } catch (error) {
    console.error('Error running financial audit:', error);
    return { success: false, error: 'Failed to run financial audit.' };
  }
}

export async function getTechStackAction(
  businessDescription: string
): Promise<ActionResult<GenerateInitialTechStackRecommendationsOutput>> {
  try {
    const recommendations = await generateInitialTechStackRecommendations({ businessDescription });
    return { success: true, data: recommendations };
  } catch (error) {
    console.error('Error generating tech stack recommendations:', error);
    return { success: false, error: 'Failed to generate tech stack recommendations.' };
  }
}

export async function deployWorkflowAction() {
  // Placeholder for a real deployment trigger
  console.log('deployWorkflowAction triggered');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: 'Workflow deployment initiated successfully!' };
}

export async function addTaskAction(task: { title: string; description?: string; status: 'todo' | 'inprogress' | 'done' }, userId: string) {
    const { firestore } = initializeFirebase();
    if (!userId) {
        return { success: false, error: 'You must be logged in to add a task.' };
    }
    
    const tasksCollectionRef = collection(firestore, 'tasks');
    const taskData = {
        ...task,
        userId: userId, // Add userId to the task document
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(tasksCollectionRef, taskData);
        revalidatePath('/tasks');
        return { success: true };
    } catch (error: unknown) {
        console.error('Error adding task:', error);

        const errorCode =
          typeof error === 'object' && error !== null && 'code' in error
            ? (error as { code?: string }).code
            : undefined;

        if (errorCode === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: tasksCollectionRef.path,
              operation: 'create',
              requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return { success: false, error: 'Failed to add task due to a permission error.' };
        }

        return { success: false, error: 'Failed to add task. Please try again.' };
    }
}
