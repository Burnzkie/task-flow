"use client";

import { useState, useTransition }          from "react";
import { deleteTask, updateTaskStatus }     from "@/app/actions/tasks";
import { showToast }                        from "@/components/toast";
import type { Task, Project }               from "@/types";


const STATUS_COLORS: Record<string, string> = {
  BACKLOG:     "#5a5a6a", TODO:      "#5eb8f7",
  IN_PROGRESS: "#f5a623", IN_REVIEW: "#7c6af7", DONE: "#5ec97c",
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog", TODO: "To Do",
  IN_PROGRESS: "In Progress", IN_REVIEW: "In Review", DONE: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH:   "bg-red-500/20 text-red-400",
  MEDIUM: "bg-amber-500/20 text-amber-400",
  LOW:    "bg-green-500/20 text-green-400",
};

interface Props {
  initialTasks: Task[];
  projects:     Project[];
}

export default function TasksClient({ initialTasks, projects }: Props) {
  const [tasks,        setTasks]        = useState(initialTasks);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isPending,    startTransition] = useTransition();

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Task deleted");
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: status as any } : t))
      );
      showToast("Status updated");
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold">All Tasks</h1>
        <span className="text-sm text-gray-500">{filtered.length} tasks</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10
                        rounded-lg px-3 py-1.5 flex-1 max-w-xs">
          {/* fixed: SVG path was garbled */}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="#666" strokeWidth="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                     text-sm text-gray-400 outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 py-4"> {/* fixed: was overFlow-y-auto */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="#666" strokeWidth="1.2"/>
                <path d="M8 12h8M8 8h5M8 16h3" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No tasks found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {["Task", "Status", "Priority", "Project", "Due Date", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 font-medium
                                         pb-3 border-b border-white/5 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 group">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                           style={{ background: STATUS_COLORS[task.status] }} />
                      <span className="text-sm text-white">{task.title}</span>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 ml-4">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="bg-transparent text-xs rounded-lg px-2 py-1 outline-none
                                 cursor-pointer border border-white/10" // fixed: was cursor-poiner
                      style={{ color: STATUS_COLORS[task.status] }}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  
                  <td className="py-3 pr-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority[0] + task.priority.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{ background: task.project.color + "22", color: task.project.color }}>
                      {task.project.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-500">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}