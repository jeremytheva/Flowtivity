'use server';

import { getAICoachAdvice } from '@/ai/flows/get-ai-coach-advice';
import { runFinancialAudit } from '@/ai/flows/run-financial-audit';
import { generateInitialTechStackRecommendations } from '@/ai/flows/generate-initial-tech-stack-recommendations';
import { getAuth } from 'firebase/auth';
import { revalidatePath } from 'next/cache';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function getCoachAdviceAction(
  businessDescription: string,
  metrics: { leadCount: number; engagementRate: number; conversionRate: number },
  recentActions: string,
) {
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

export async function runFinancialAuditAction() {
  try {
    const auditResults = await runFinancialAudit();
    return { success: true, data: auditResults };
  } catch (error) {
    console.error('Error running financial audit:', error);
    return { success: false, error: 'Failed to run financial audit.' };
  }
}

export async function getTechStackAction(businessDescription: string) {
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
    
    try {
        const tasksCollectionRef = collection(firestore, 'users', userId, 'tasks');
        const taskData = {
            ...task,
            createdAt: serverTimestamp(),
        };
        await addDoc(tasksCollectionRef, taskData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
              path: tasksCollectionRef.path,
              operation: 'create',
              requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
            // We don't re-throw here because we want to return a structured error response
        });
        revalidatePath('/tasks');
        return { success: true };
    } catch (error) {
        // This will now primarily catch errors emitted by our handler
        return { success: false, error: 'Failed to add task due to a permission error.' };
    }
}
