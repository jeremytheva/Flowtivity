import { KanbanBoard } from "@/components/tasks/kanban-board";

export default function TasksPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline tracking-tight">Task Board</h1>
            <p className="text-muted-foreground mt-2">Organize your strategic initiatives and daily to-dos.</p>
            <div className="mt-8">
                <KanbanBoard />
            </div>
        </div>
    );
}
