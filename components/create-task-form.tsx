"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm }      from "react-hook-form";
import { zodResolver }  from "@hookform/resolvers/zod";
import { createTask, updateTask } from "@/app/actions/tasks";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations";
import { showToast }    from "@/components/toast";
import type { Project, Task } from "@/types";

interface Props {
  projects:       Project[];
  defaultStatus?: string;
  onCreated?:     (task: unknown) => void;
  editTask?:      Task | null;
  onUpdated?:     (task: unknown) => void;
  onCancel?:      () => void;
  forceOpen?:     boolean;
  // fixed: new prop to receive AI suggestion prefill data
  prefillData?:   { title: string; priority: string; tags: string; projectId: string } | null;
}

export default function CreateTaskForm({
  projects, defaultStatus = "TODO", onCreated,
  editTask, onUpdated, onCancel, forceOpen, prefillData,
}: Props) {
  const [open, setOpen]              = useState(forceOpen ?? false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTaskInput>({
    resolver:      zodResolver(createTaskSchema),
    defaultValues: {
      status:    (editTask?.status   ?? defaultStatus) as any,
      priority:  (editTask?.priority ?? "MEDIUM")      as any,
      projectId: editTask?.projectId ?? projects[0]?.id ?? "",
      title:     editTask?.title     ?? "",
      tags:      editTask?.tags?.join(", ") ?? "",
      dueDate:   editTask?.dueDate
        ? new Date(editTask.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  // Re-populate form when editTask changes
  // fixed: added reset to dependency array
  useEffect(() => {
    if (editTask) {
      reset({
        title:     editTask.title,
        status:    editTask.status    as any,
        priority:  editTask.priority  as any,
        projectId: editTask.projectId,
        tags:      editTask.tags.join(", "),
        dueDate:   editTask.dueDate
          ? new Date(editTask.dueDate).toISOString().split("T")[0]
          : "",
      });
      setOpen(true);
    }
  }, [editTask, reset]); // fixed: added reset

  // Pre-fill from AI suggestion
  // fixed: wires prefillData into the form and opens it automatically
  useEffect(() => {
    if (prefillData) {
      reset({
        title:     prefillData.title,
        priority:  prefillData.priority as any,
        tags:      prefillData.tags,
        projectId: prefillData.projectId,
        status:    defaultStatus as any,
      });
      setOpen(true);
    }
  }, [prefillData, reset, defaultStatus]);

  function onSubmit(data: CreateTaskInput) {
    startTransition(async () => {
      try {
        if (editTask) {
          const task = await updateTask({ ...data, id: editTask.id });
          onUpdated?.(task);
          showToast("Task updated!");
        } else {
          const task = await createTask(data);
          onCreated?.(task);
          showToast("Task created!");
        }
        reset();
        setOpen(false);
        onCancel?.();
      } catch {
        showToast("Something went wrong", "error");
      }
    });
  }

  if (!open && !forceOpen) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-1 py-1.5 text-xs text-gray-600 hover:text-gray-400
                   border border-dashed border-white/10 hover:border-white/20
                   rounded-lg transition-all"
      >
        + Add task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="mt-1 bg-gray-800 border border-white/15 rounded-xl p-3"
    >
      <p className="text-xs text-gray-500 mb-2 font-medium">
        {editTask ? "Edit task" : "New task"}
      </p>

      <input
        {...register("title")}
        placeholder="Task title..."
        autoFocus
        className="w-full bg-transparent text-sm text-white placeholder-gray-600
                   outline-none mb-2"
      />
      {errors.title && (
        <p className="text-red-400 text-xs mb-2">{errors.title.message}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <select {...register("priority")}
          className="bg-gray-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select {...register("projectId")}
          className="bg-gray-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none">
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <input
        {...register("dueDate")}
        type="date"
        className="w-full bg-gray-700 border border-white/10 rounded-lg px-2 py-1.5
                   text-xs text-gray-300 outline-none mb-2"
      />

      <input
        {...register("tags")}
        placeholder="Tags (comma separated)..."
        className="w-full bg-transparent text-xs text-gray-400 placeholder-gray-600
                   outline-none mb-3 border-b border-white/5 pb-2"
      />

      <input type="hidden" {...register("status")} />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs
                     py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : editTask ? "Save changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); onCancel?.(); }}
          className="px-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}