"use server";

import { auth }          from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma }        from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations";

export async function getProjects() {
  const { userId } = await auth(); // ← add await
  if (!userId) throw new Error("Unauthorized");

  return prisma.project.findMany({
    where:   { userId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProject(formData: unknown) {
  const { userId } = await auth(); // ← add await
  if (!userId) throw new Error("Unauthorized");

  const data = createProjectSchema.parse(formData);

  const project = await prisma.project.create({
    data: { ...data, userId },
  });

  revalidatePath("/");
  return project;
}