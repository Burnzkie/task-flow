export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    tags: string[];
    order: number;
    userId: string;
    projectId: string;
    project: {id: string; name: string; color: string};
    createdAt: Date;
    updatedAt: Date;
}

export interface Project{
    id: string;
    name: string;
    color: string;
    userId: string;
    _count?: {tasks: number};
}