import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  businessName?: string;
  industry?: string;
  goals?: string[];
  teamSize?: '1' | '2-10' | '11-50' | '50+';
  onboardingComplete: boolean;
}

export interface BusinessProfile {
  businessName: string;
  industry: string;
  goals: string[];
  teamSize: '1' | '2-10' | '11-50' | '50+';
}

export interface DashboardMetrics {
  userId: string;
  leadCount: number;
  engagementRate: number;
  conversionRate: number;
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Timestamp;
}

export const taskStatuses: TaskStatus[] = ['todo', 'inprogress', 'done'];

export const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};
