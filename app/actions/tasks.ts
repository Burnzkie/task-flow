"use server";

import { auth }          from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma }        from "@/lib/prisma";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations";

export async function getTasks(filters?: {
  projectId?: string;
  q?:         string;
  priority?:  string;
  status?:    string; 
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.task.findMany({
    where: {
      userId,
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.priority  ? { priority: filters.priority as any } : {}),
      ...(filters?.status    ? { status: filters.status as any }    : {}),
      ...(filters?.q ? {
        title: { contains: filters.q, mode: "insensitive" as const },
      } : {}),
    },
    include:  { project: true },
    orderBy:  [{ status: "asc" }, { order: "asc" }],
  });
}

export async function createTask(formData: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = createTaskSchema.parse(formData);

  const task = await prisma.task.create({
    data: {
      title:       data.title,                
      description: data.description,
      status:      data.status,
      priority:    data.priority,
      dueDate:     data.dueDate ? new Date(data.dueDate) : null, // fixed: was data.update
      tags:        data.tags
                     ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
                     : [],
      projectId:   data.projectId,
      userId,
    },
    include: { project: true },
  });

  revalidatePath("/");
  return task;
}

export async function updateTask(formData: unknown) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = updateTaskSchema.parse(formData);
  const { id, ...rest } = data;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
      tags:    rest.tags
                 ? rest.tags.split(",").map((t) => t.trim()).filter(Boolean)
                 : undefined,
    },
    include: { project: true },
  });

  revalidatePath("/");
  return task;
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}

export async function updateTaskStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.updateMany({
    where: { id, userId },
    data:  { status: status as any },
  });

  revalidatePath("/");
}