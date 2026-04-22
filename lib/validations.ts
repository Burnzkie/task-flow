import {z} from "zod";

export const createTaskSchema = z.object({
title: z.string().min(1, "Title is required").max(100),
description: z.string().optional(),
status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
dueDate: z.string().optional(),
tags: z.string().optional(),
projectId: z.string().min(1, "Project is required"),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    id:z.string(),
});

export const createProjectSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"), 
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;