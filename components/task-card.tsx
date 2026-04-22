"use client";

import { useState }   from "react";
import { deleteTask } from "@/app/actions/tasks";
import { showToast }  from "@/components/toast";
import type { Task }  from "@/types";

const priorityConfig = {
  HIGH:   { label: "High",   class: "bg-red-500/20 text-red-400"   },
  MEDIUM: { label: "Medium", class: "bg-amber-500/20 text-amber-400" },
  LOW:    { label: "Low",    class: "bg-green-500/20 text-green-400" },
};

interface Props {
  task:         Task;
  isDragging?:  boolean;
  onEdit?:      (task: Task) => void;
  onDeleted?:   (id: string) => void;
}

export default function TaskCard({ task, isDragging, onEdit, onDeleted }: Props) {
  const pri      = priorityConfig[task.priority];
  const isOverdue = task.dueDate &&
    new Date(task.dueDate) < new Date() && task.status !== "DONE";

  async function handleDelete() {
    await deleteTask(task.id);
    onDeleted?.(task.id);
    showToast("Task deleted");
  }

  return (
    <div className={`bg-gray-800/80 border rounded-xl p-3.5 cursor-grab transition-all
      ${isDragging
        ? "border-violet-500 shadow-lg shadow-violet-500/20 rotate-1"
        : "border-white/10 hover:border-white/20"}`}
    >
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-gray-100 leading-snug mb-2">{task.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${pri.class}`}>
          {pri.label}
        </span>
        {task.dueDate && (
          <span className={`text-[11px] ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
            {isOverdue ? "⚠ " : ""}
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5">
        <span className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ background: task.project.color + "22", color: task.project.color }}>
          {task.project.name}
        </span>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-[11px] text-gray-600 hover:text-violet-400 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-[11px] text-gray-600 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}