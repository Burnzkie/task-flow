import { getTasks } from "@/app/actions/tasks";
import { getProjects } from "@/app/actions/projects";
import KanbanBoard from "@/components/kanban-board";
import SearchFilterBar from "@/components/search-filter-bar";
import { Suspense } from "react";

export default async function DashboardPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await props.searchParams;

  const [tasks, projects] = await Promise.all([
    getTasks({
      projectId: params.project,
      q: params.q,
      priority: params.priority,
      status: params.status,
    }),
    getProjects(),
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold">Board</h1>
      </div>
      <Suspense fallback={<div className="h-12 border-b border-white/10" />}>
        <SearchFilterBar />
      </Suspense>
      <KanbanBoard initialTasks={tasks} projects={projects} />
    </div>
  );
}