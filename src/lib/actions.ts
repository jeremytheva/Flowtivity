'use server';

import { getAICoachAdvice } from '@/ai/flows/get-ai-coach-advice';
import { runFinancialAudit } from '@/ai/flows/run-financial-audit';
import { generateInitialTechStackRecommendations } from '@/ai/flows/generate-initial-tech-stack-recommendations';
import { auth } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

import { db } from './firebase';
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

export async function addTaskAction(task: { title: string; description?: string; status: 'todo' | 'inprogress' | 'done' }) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: 'You must be logged in to add a task.' };
    }
    
    try {
        const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
        await addDoc(tasksCollectionRef, {
            ...task,
            createdAt: serverTimestamp(),
        });
        revalidatePath('/tasks');
        return { success: true };
    } catch (error) {
        console.error('Error adding task:', error);
        return { success: false, error: 'Failed to add task.' };
    }
}
