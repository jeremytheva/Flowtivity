'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Task, TaskStatus, taskStatuses, statusLabels } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { CreateTaskDialog } from './create-task-dialog';
import { KanbanCard } from './kanban-card';

export function KanbanBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  const tasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </div>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {taskStatuses.map((status) => (
                <Card key={status} className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center justify-between">
                            {statusLabels[status]}
                            <span className="text-sm font-medium text-muted-foreground bg-background rounded-full px-2 py-1">
                                {tasksByStatus(status).length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 min-h-48">
                        {tasksByStatus(status).map((task) => (
                        <KanbanCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                        ))}
                    </CardContent>
                </Card>
            ))}
            </div>
        )}
        <CreateTaskDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
