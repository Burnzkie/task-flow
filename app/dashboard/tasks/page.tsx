import { getTasks }    from "@/app/actions/tasks";
import { getProjects } from "@/app/actions/projects";
import TasksClient     from "@/components/task-client";

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);
  return <TasksClient initialTasks={tasks} projects={projects} />;
}