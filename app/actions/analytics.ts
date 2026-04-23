"use server";

import { auth }   from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

type GroupByResult = { _count: { id: number } };
type StatusGroup   = GroupByResult & { status: string };
type PriorityGroup = GroupByResult & { priority: string };

export async function getAnalytics() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tasksByStatus, tasksByPriority, recentActivity, totals] =
    await Promise.all([
      prisma.task.groupBy({
        by:     ["status"],
        where:  { userId },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by:     ["priority"],
        where:  { userId },
        _count: { id: true },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status:    "DONE",
          updatedAt: { gte: subDays(new Date(), 6) },
        },
        select: { updatedAt: true },
      }),
      prisma.task.aggregate({
        where:  { userId },
        _count: { id: true },
      }),
    ]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date  = subDays(new Date(), 6 - i);
    const label = format(date, "MMM d");
    const count = recentActivity.filter(
      (t: { updatedAt: Date }) => format(t.updatedAt, "MMM d") === label
    ).length;
    return { date: label, completed: count };
  });

  const totalTasks   = totals._count.id;
  const doneTasks    = (tasksByStatus as StatusGroup[]).find((s) => s.status === "DONE")?._count.id ?? 0;
  const overdueTasks = await prisma.task.count({
    where: {
      userId,
      status:  { not: "DONE" },
      dueDate: { lt: new Date() },
    },
  });

  return {
    tasksByStatus:   (tasksByStatus as StatusGroup[]).map((s) => ({ name: s.status,    value: s._count.id })),
    tasksByPriority: (tasksByPriority as PriorityGroup[]).map((p) => ({ name: p.priority, value: p._count.id })),
    activityByDay:   last7Days,
    stats: {
      total:          totalTasks,
      done:           doneTasks,
      overdue:        overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    },
  };
}