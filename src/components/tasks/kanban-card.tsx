'use client';

import { Task, TaskStatus, taskStatuses, statusLabels } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

type KanbanCardProps = {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
};

export function KanbanCard({ task, onStatusChange }: KanbanCardProps) {
  return (
    <Card className="bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {taskStatuses.map(status => (
                    <DropdownMenuItem key={status} onClick={() => onStatusChange(task.id, status)} disabled={task.status === status}>
                        Move to {statusLabels[status]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      {task.description && (
        <CardContent className="p-4 pt-0">
          <CardDescription>{task.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}
